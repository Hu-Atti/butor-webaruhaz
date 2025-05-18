import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../models/user.model';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { Order } from '../../models/order.model';
import { UserService } from '../../shared/services/user.service';
import { OrderService } from '../../shared/services/order.service';
import { SimpleCurrencyPipe } from '../../shared/pipes/simple-currency.pipe';
import { deleteDoc, doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';
import { FurnitureService } from '../../shared/services/furniture.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Furniture } from '../../models/furniture.model';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


@Component({
  selector: 'app-profile',
  imports: [
    SimpleCurrencyPipe,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    DatePipe,
    MatSlideToggleModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  user: User | null = null;
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  ordersWithDetails: Array<{
    order: Order,
    items: { furniture: Furniture, quantity: number }[]
  }> = [];

  firstname = '';
  lastname = '';
  address = '';

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private orderService: OrderService,
    private authService: AuthService,
    private furnitureService: FurnitureService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserAndOrders();
  }

  async loadUserAndOrders() {
    this.loading = true;
    this.userService.getUserWithOrders().subscribe({
      next: async ({ user, orders }) => {
        this.user = user;
        this.orders = orders.filter(o => o.confirmed);

        this.ordersWithDetails = [];
        for (const order of this.orders) {
          const items = [];
          for (let i = 0; i < order.furnitureIds.length; i++) {
            const furniture = await this.furnitureService.getFurnitureById(order.furnitureIds[i]);
            if (furniture) {
              items.push({
                furniture: furniture,
                quantity: order.quantitys[i]
              });
            }
          }
          this.ordersWithDetails.push({ order, items });
        }

        if (user) {
          this.firstname = user.name.firstname;
          this.lastname = user.name.lastname;
          this.address = user.address;
        }

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Hiba a profil betöltésekor';
        console.error(err);
        this.loading = false;
      }
    });
  }

  async updateUser() {
    if (!this.user) return;

    try {
      await this.userService.updateUser(this.user.id, {
        name: { firstname: this.firstname, lastname: this.lastname },
        address: this.address
      });
      this.user.name.firstname = this.firstname;
      this.user.name.lastname = this.lastname;
      this.user.address = this.address;
      this.snackBar.open('Adatok sikeresen frissítve!', 'OK', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (err) {
      this.snackBar.open('Hiba az adatok frissítésekor', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async toggleAdminStatus() {
    if (!this.user) return;
    
    try {
      const newStatus = !this.user.isAdmin;
      await this.userService.updateUser(this.user.id, { isAdmin: newStatus });
      this.user.isAdmin = newStatus;
      this.snackBar.open('Admin státusz frissítve!', 'OK', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Hiba az admin státusz módosításakor', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const order = await this.orderService.getOrderById(orderId);
    if (!order) throw new Error('A rendelés nem található');

    for (let i = 0; i < order.furnitureIds.length; i++) {
      const furnitureId = order.furnitureIds[i];
      const quantity = order.quantitys[i];
      try {
        await this.furnitureService.increaseFurnitureQuantity(furnitureId, quantity);
      } catch (err) {
        console.error(`Hiba a ${furnitureId} termék készletének frissítésekor:`, err);
      }
    }

    const orderDocRef = doc(this.firestore, 'Orders', orderId);
    await deleteDoc(orderDocRef);

    const userDocRef = doc(this.firestore, 'Users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;
    const updatedOrderIds = (userData.orderIds || []).filter(id => id !== orderId);
    await updateDoc(userDocRef, { orderIds: updatedOrderIds });

    this.loadUserAndOrders();
  }


  async deleteUser() {
  if (!this.user) return;
  if (!confirm('Biztosan törlöd a felhasználót és az összes rendelést?')) return;

  try {
    await this.userService.deleteUser(this.user.id);
    
    await this.authService.signOut();
    await this.authService.deleteUser();
  
    this.user = null;
    this.orders = [];
    this.router.navigate(['/home']);      
    this.snackBar.open('Felhasználó sikeresen törölve!', 'OK', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    } catch (err) {
      this.snackBar.open('Hiba a felhasználó törlésekor', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
