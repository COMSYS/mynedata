import {Injectable, OnDestroy} from '@angular/core';
import {environment as env} from '../../../environments/environment';
import {LoggerService} from './logger.service';
import { localeConfig } from '../../../config/locale.config';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService implements OnDestroy {
  private locale: Promise<any>;
  private localeAbbr: string;
  private _isReady: boolean;

  constructor(private logger: LoggerService) {
    this._isReady = false;
    this.localeAbbr = env.locale.default;  // IMPORTANT! have to do it this way, if using env.locale directly in path the app breaks
    import(`../../../locale/${this.localeAbbr}.locale.ts`).then(localeFile => {
      this.locale = localeFile.locale;
      if (!this.locale) {
        return Promise.reject('File was found but definition was not.');
      }
      this._isReady = true;
      this.logger.print(`loaded locale ${this.localeAbbr}`);
    }).catch(error => {
      this.logger.print(`couldn't default load locale ${this.localeAbbr} because '${error}'`);
      this.localeAbbr = env.locale.fallback;
      this.logger.print(`trying to load fallback locale ${this.localeAbbr}`);

      // trying to import the fallback locale
      import(`../../../locale/${this.localeAbbr}.locale.ts`).then(localeFile => {
          this.locale = localeFile.locale;
          if (!this.locale) {
              return Promise.reject('File was found but definition was not.');
          }
          this._isReady = true;
          this.logger.print(`successfully loaded fallback locale ${this.localeAbbr}`);
      }).catch(error2 => {
          this.logger.print(`couldn't load fallback locale ${this.localeAbbr} because '${error2}'`);
          return Promise.reject(error2);
      });
    });
  }

  ngOnDestroy(): void {
    this.locale = undefined;
    this.localeAbbr = undefined;
    this._isReady = undefined;
    this.logger = undefined;
  }

  get(id: string): string {
    if (this.locale && this.locale[id]) {
      return this.locale[id];
    } else {
      return `can't find locale '${id}'`;
    }
  }

  public isReady(): boolean {
    return this._isReady;
  }

  public getCountryName(country: string) {
    if (this.locale && this.locale['countries'] && this.locale['countries'][country]) {
      return this.locale['countries'][country];
    } else {
      return `can't find locale of country '${country}'`;
    }
  }

  public getLocale(): string {
    return this.localeAbbr;
  }
}
