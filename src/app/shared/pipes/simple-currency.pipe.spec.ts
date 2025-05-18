import { SimpleCurrencyPipe } from './simple-currency.pipe';

describe('SimpleCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new SimpleCurrencyPipe();
    expect(pipe).toBeTruthy();
  });
});
