import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'simpleCurrency',
  standalone: true,
})
export class SimpleCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    return `${value.toLocaleString('hu-HU')} Ft`;
  }
}
