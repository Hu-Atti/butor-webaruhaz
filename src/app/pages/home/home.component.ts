import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Furniture } from '../../models/furniture.model';
import { FurnitureService } from '../../shared/services/furniture.service';
import { FurnitureCardComponent } from '../../shared/furniture-card/furniture-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../shared/services/category.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { OrderService } from '../../shared/services/order.service';
import { of, switchMap } from 'rxjs';
import { User } from '../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  imports: [
    FurnitureCardComponent,
    MatIconModule,
    MatCardModule,
    RouterLink,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  lowStockFurnitures: Furniture[] = [];
  categories: Category[] = [];  

  isLoggedIn = false;
  currentUser: User | null = null;

  constructor(
    private furnitureService: FurnitureService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private userService: UserService,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.lowStockFurnitures = await this.furnitureService.getLowStockFurnitures();
    this.categoryService.getAllCategories().subscribe(cats => {
      this.categories = cats;
    });
    this.authService.currentUser.pipe(
      switchMap(user => {
        this.isLoggedIn = !!user;
        return user ? this.userService.getUserWithOrders() : of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.currentUser = result.user;
      }
    });
  }

  async addToCart(furniture: Furniture) {
    if (!this.currentUser) return;

    try {
      let activeOrder = await this.orderService.getUnconfirmedOrder(this.currentUser.id);

      if (!activeOrder) {
        activeOrder = await this.orderService.addOrder({
          furnitureIds: [],
          quantitys: [],
          total: 0,
          confirmed: false,
          userId: this.currentUser.id
        });
        await this.userService.addOrderToUser(this.currentUser.id, activeOrder.id);
      }

      const itemIndex = activeOrder.furnitureIds.indexOf(furniture.id);
      await this.furnitureService.decreaseFurnitureQuantity(furniture.id, 1);

      if (itemIndex > -1) {
        const newQuantities = [...activeOrder.quantitys];
        newQuantities[itemIndex] += 1;
        await this.orderService.updateOrder(activeOrder.id, {
          quantitys: newQuantities,
          total: activeOrder.total + furniture.price
        });
      } else {
        await this.orderService.updateOrder(activeOrder.id, {
          furnitureIds: [...activeOrder.furnitureIds, furniture.id],
          quantitys: [...activeOrder.quantitys, 1],
          total: activeOrder.total + furniture.price
        });
      }

      this.lowStockFurnitures = await this.furnitureService.getLowStockFurnitures();
      this.snackBar.open('Termék hozzáadva a kosárhoz!', 'OK', { 
        duration: 2000,
        panelClass: ['success-snackbar']
      });

    } catch (error) {
      this.snackBar.open('Hiba a termék kosárba helyezésekor', 'Bezár', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
  }
}
