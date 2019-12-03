import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {HeaderLinkData, headerLinksConfig} from '../../../config/header-links.config';
import {SessionService} from '../services/session.service';
import {LocalizationService} from '../services/localization.service';
import {UserRole} from '../../../config/user-roles.config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    navLinks: HeaderLinkData[];

  constructor(private router: Router, private _session: SessionService, public locale: LocalizationService) {
    // creating a fake EndNavigation object to feed to the setNavLinks upon the very first arrival, most likely when opening page in browser
    const _fakeNavigationEnd: NavigationEnd = {
        urlAfterRedirects: this.router.url,
        id: 0,
        url: this.router.url
    };
    this.setNavLinks(_fakeNavigationEnd);
  }

  setNavLinks(event: NavigationEnd): void {
    let _foundLinks: boolean = false;
    for (const category of headerLinksConfig) {
      const _regexExpression = new RegExp(category.path);
      if (_regexExpression.test(event.urlAfterRedirects)) {
        this.navLinks = category.links;
        _foundLinks = true;
      }
    }
    if (!_foundLinks) {
      this.navLinks = null;
    }
  }

  ngOnInit() {
    this.router.events
      .subscribe(
        event => {
          if (event instanceof NavigationEnd) {
              this.setNavLinks(event);
          }
        }
      );
  }

  showLogout(): boolean {
      return this._session.isLoggedIn();
  }

  invokeLogout(): void {
      this._session.destroySession();
  }

  useUserZone(): boolean {
      return this._session.isLoggedIn(UserRole.ENDUSER);
  }

  getMynedataLogoPath(): String {
      return `../../../assets/${this.locale.get('mynedata-logo-path')}`;
  }

  useProcessorZone(): boolean {
    return this._session.isLoggedInAs(UserRole.DATAPROCESSOR);
  }

}
