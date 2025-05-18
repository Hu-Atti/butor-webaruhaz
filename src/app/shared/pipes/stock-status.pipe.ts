import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stockStatus',
  standalone: true,
})
export class StockStatusPipe implements PipeTransform {
  transform(quantity: number): string {
    if (quantity <= 0) return 'Nincs készleten';
    if (quantity == 1) return 'Utolsó darab';
    if (quantity < 5) return 'Pár darab maradt';
    return 'Raktáron';
  }
}