import { Component } from '@angular/core';
import { FurnitureCardComponent } from '../../shared/furniture-card/furniture-card.component';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Furniture } from '../../models/furniture.model';
import { FurnitureService } from '../../shared/services/furniture.service';
import { AuthService } from '../../shared/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../../shared/services/user.service';
import { OrderService } from '../../shared/services/order.service';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';
import { of, switchMap } from 'rxjs';
import { CategoryService } from '../../shared/services/category.service';
import { Category } from '../../models/category.model';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-products',
  imports: [
    FurnitureCardComponent, 
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatAutocompleteModule,
    MatSelectModule,
    FurnitureCardComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  form: FormGroup
  furnitures: Furniture[] = [];
  categories: Category[] = [];
  editingFurniture: Furniture | null = null;
  isAdmin = false;
  isLoggedIn = false;
  currentUser: User | null = null;
  hasOrders = false;
  newCategoryName = '';
  categoryToDelete = '';   
  categoryFormExpanded = false;
  furnitureFormExpanded = false;
  filterExpanded = false;
  selectedCategory?: string;
  sortBy: 'name' | 'price' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
      private furnitureService: FurnitureService,
      private authService: AuthService,
      private userService: UserService,
      private orderService: OrderService,
      private categoryService: CategoryService,
      private fb: FormBuilder,
      private snackBar: MatSnackBar
      
    ) {
       this.form = this.fb.group({
        id: [''],
        name: [''],
        price: [0],
        quantity: [0],
        picURL: [''],
        categoryId: ['']
      });
    }

  async ngOnInit(): Promise<void> {
    this.categoryService.getAllCategories().subscribe(data => this.categories = data);
    await this.loadFurniture();
    this.authService.currentUser.pipe(
      switchMap(user => {
        this.isLoggedIn = !!user;
        return user ? this.userService.getUserWithOrders() : of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.currentUser = result.user;
        this.hasOrders = !!result.user?.orderIds?.length;
        this.isAdmin = result.user?.isAdmin ?? false;
      }
    });
  }

  async loadFurniture() {
  try {
    if(this.selectedCategory || this.sortBy !== 'name' || this.sortDirection !== 'asc') {
      this.furnitures = await this.furnitureService.getFilteredFurniture(
        this.selectedCategory,
        this.sortBy,
        this.sortDirection
      );
    } else {
      this.furnitureService.getAllFurniture().subscribe(data => {
        this.furnitures = data;
      });
    }
  } catch (error) {
      console.error('Hiba a bútorok betöltésekor:', error);
      this.snackBar.open('Hiba a szűrés végrehajtásakor', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
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
  startEdit(furniture: Furniture) {
    this.editingFurniture = furniture;
    this.form.patchValue(furniture);
  }

  cancelEdit() {
    this.editingFurniture = null;
    this.form.reset();
  }

  async save() {
    try {
      const value = this.form.value;
      if (this.editingFurniture) {
        await this.furnitureService.updateFurniture(this.editingFurniture.id, value);
        this.snackBar.open('Bútor sikeresen frissítve!', 'OK', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      } else {
        await this.furnitureService.addFurniture(value);
        this.snackBar.open('Bútor sikeresen hozzáadva!', 'OK', { 
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      }
      this.cancelEdit();
      await this.loadFurniture();
    } catch (error) {
      this.snackBar.open('Hiba a művelet végrehajtásakor', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async delete(id: string) {
    try {
      await this.furnitureService.deleteFurniture(id);
      this.snackBar.open('Bútor sikeresen törölve!', 'OK', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
      await this.loadFurniture();
    } catch (error) {
      this.snackBar.open('Hiba a törlés során', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async addCategory() {
    try {
      if (this.newCategoryName) {
        await this.categoryService.addCategory({ name: this.newCategoryName });
        this.newCategoryName = '';
        this.snackBar.open('Kategória hozzáadva!', 'OK', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        this.categoryService.getAllCategories().subscribe(data => this.categories = data);
      }
    } catch (error) {
      this.snackBar.open('Hiba a kategória hozzáadásakor', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async deleteCategory() {
    try {
      if (this.categoryToDelete) {
        await this.categoryService.deleteCategory(this.categoryToDelete);
        this.categoryToDelete = '';
        this.snackBar.open('Kategória törölve!', 'OK', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        this.categoryService.getAllCategories().subscribe(data => this.categories = data);
      }
    } catch (error) {
      this.snackBar.open('Hiba a kategória törlésekor', 'Bezár', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  toggleCategoryForm() {
    this.categoryFormExpanded = !this.categoryFormExpanded;
  }

  toggleFilters() {
    this.filterExpanded = !this.filterExpanded;
  }

  toggleFurnitureForm() {
    this.furnitureFormExpanded = !this.furnitureFormExpanded;
  }
}
