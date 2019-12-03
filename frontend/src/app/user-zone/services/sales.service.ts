import {Injectable, OnDestroy} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SalesService implements OnDestroy {

  private _currentNumberOfSales: number;

  constructor() {
    this._currentNumberOfSales = 2;
  }

  ngOnDestroy(): void {
    this._currentNumberOfSales = undefined;
  }

  public getQuantityOfSales(): number {
    return this._currentNumberOfSales;
  }

  public addSale(): void {
    this._currentNumberOfSales++;
  }
}
