import { Component, OnInit } from '@angular/core';
import { CartItem, Order } from '../../models/order.model';
import { Furniture } from '../../models/furniture.model';
import { OrderService } from '../../shared/services/order.service';
import { FurnitureService } from '../../shared/services/furniture.service';
import { AuthService } from '../../shared/services/auth.service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { SimpleCurrencyPipe } from '../../shared/pipes/simple-currency.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cart',
  imports: [
    MatSnackBarModule,
    MatIconModule,
    SimpleCurrencyPipe,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  order: Order | null = null;
  items: (CartItem & { furniture: Furniture })[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private furnitureService: FurnitureService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    try {
      const firebaseUser = await firstValueFrom(this.authService.currentUser);
      
      if (firebaseUser) {
        const userId = firebaseUser.uid;
        const order = await this.orderService.getUnconfirmedOrder(userId);
        
        if (order) {
          this.order = order;
          await this.loadItems();
        }
      }
    } catch (error) {
      console.error('Hiba:', error);
      this.snackBar.open('Hiba a kosár betöltésekor', 'Bezár', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  private async loadItems() {
    if (!this.order) return;
    
    this.items = [];
    for (let i = 0; i < this.order.furnitureIds.length; i++) {
      const furniture = await this.furnitureService.getFurnitureById(this.order.furnitureIds[i]);
      if (furniture) {
        this.items.push({
          furniture,
          furnitureId: furniture.id,
          quantity: this.order.quantitys[i],
          price: furniture.price,
        });
      }
    }
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async updateQuantity(index: number, change: number) {
    if (!this.order) return;

    const newQuantity = this.items[index].quantity + change;
    if (newQuantity < 1) return;

    try {
      if (change > 0) {
        const furnitureId = this.items[index].furniture.id;
        
        const currentFurniture = await this.furnitureService.getFurnitureById(furnitureId);
        
        if (!currentFurniture) {
          this.snackBar.open('A termék nem található!', 'Bezár', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        if (currentFurniture.quantity < change) {
          this.snackBar.open('Nincs elég készleten!', 'Bezár', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }
      }

      await this.furnitureService.increaseFurnitureQuantity(
        this.items[index].furniture.id, 
        change * -1
      );

      this.order.quantitys[index] = newQuantity;
      this.order.total = this.total;
      await this.orderService.updateOrder(this.order.id, {
        quantitys: this.order.quantitys,
        total: this.order.total
      });

      this.items[index].quantity = newQuantity;

    } catch (error) {
      console.error('Hiba:', error);
      this.snackBar.open('Hiba történt a mennyiség módosítása közben', 'Bezár', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async removeItem(index: number) {
    if (!this.order) return;

    const furnitureId = this.order.furnitureIds[index];
    
    await this.furnitureService.increaseFurnitureQuantity(
      furnitureId,
      this.items[index].quantity
    );

    this.order.furnitureIds.splice(index, 1);
    this.order.quantitys.splice(index, 1);
    this.order.total = this.total;

    if (this.order.furnitureIds.length === 0) {
      await this.orderService.deleteOrder(this.order.id);
      this.order = null;
    } else {
      await this.orderService.updateOrder(this.order.id, this.order);
    }

    this.items.splice(index, 1);
  }

  async confirmOrder() {
    if (!this.order) return;
    
    await this.orderService.updateOrder(this.order.id, { confirmed: true });
    this.snackBar.open('Rendelés sikeresen leadva!', 'OK', { duration: 3000 });
    this.order = null;
    this.items = [];
  }

}
