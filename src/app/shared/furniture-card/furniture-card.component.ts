import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../models/furniture.model';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { SimpleCurrencyPipe } from '../pipes/simple-currency.pipe';
import { StockStatusPipe } from '../pipes/stock-status.pipe';
import { Category } from '../../models/category.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-furniture-card',
  imports: [
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    SimpleCurrencyPipe,
    StockStatusPipe
  ],
  templateUrl: './furniture-card.component.html',
  styleUrl: '../../pages/products/products.component.scss'
})
export class FurnitureCardComponent {
  @Input() furniture!: Furniture;
  @Input() isAdmin: boolean = false;
  @Input() isLoggedIn: boolean = false;
  @Input() categories: Category[] = [];
  
  @Output() addToCart = new EventEmitter<Furniture>();
  @Output() edit = new EventEmitter<Furniture>();
  @Output() delete = new EventEmitter<string>();

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Kategorizálatlan';
  }
}
