import {Injectable, OnDestroy} from '@angular/core';
import { environment as env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService implements OnDestroy {
  private devMode: boolean;

  constructor() {
    this.devMode = env.devMode;
  }

  ngOnDestroy(): void {
    this.devMode = undefined;
  }

  isDevMode(): boolean {
    return !env.production && this.devMode;
  }

  setDevMode(logicalValue: boolean): void {
    this.devMode = logicalValue;
  }

  print(...msg: any[]): void {
    if (this.isDevMode()) {
      console.log(...msg);
    }
  }
}
