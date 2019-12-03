import {Component, OnInit} from '@angular/core';
import {SessionService} from './core/services/session.service';
import {NavigationEnd, Router} from '@angular/router';
import {LocalizationService} from './core/services/localization.service';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'de'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class AppComponent implements OnInit{
  public showSidebar: boolean;

  constructor(private _session: SessionService, private router: Router, public locale: LocalizationService) {
    this.showSidebar = false;
  }

  ngOnInit() {
    this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.onRouteChange(event);
        }
      }
    );
  }

  private onRouteChange(event: NavigationEnd) {
      this.showSidebar = this._session.isLoggedIn();
  }
}
