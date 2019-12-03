import {Component, DoCheck, OnInit} from '@angular/core';
import {LocalizationService} from '../services/localization.service';
import {SidebarLinkData, SidebarLinkDataRole, sidebarLinksConfig} from '../../../config/sidebar-links.config';
import {SessionService} from '../services/session.service';
import {RequestsService} from '../services/requests.service';
import {Observable, Subscription} from 'rxjs';
import {init} from 'protractor/built/launcher';
import {UserRole} from '../../../config/user-roles.config';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  navLinks: SidebarLinkData[] = [];

  public numberOfPendingRequests$: Observable<number>;

  constructor(
    public _locale: LocalizationService,
    private _session: SessionService,
    private _requestsService: RequestsService
  ) {
    this._initObservables();
    this.setNavLinks();
  }

  ngOnInit() {
    this._initObservables();
  }

  private async _initObservables(): Promise<void> {
    if (this._session.isLoggedInAs(UserRole.ENDUSER)) {
      this.numberOfPendingRequests$ = this._requestsService.getNumberOfPendingRequests$(true);
    }
  }

  setNavLinks(): void {
    for (const link of sidebarLinksConfig) {
      if (link.name === 'requests' && this._session.isLoggedInAs(UserRole.ENDUSER)) {
        link.badgeValue$ = this.numberOfPendingRequests$;
      } else {
        link.badgeValue$ = undefined;
      }
      switch (link.role) {
          case SidebarLinkDataRole.USER:
            if (this._session.isLoggedIn(UserRole.ENDUSER)) {
              this.navLinks.push(link);
            }
            break;
          case SidebarLinkDataRole.PROCESSOR:
            if (this._session.isLoggedIn(UserRole.DATAPROCESSOR)) {
                this.navLinks.push(link);
            }
            break;
          case SidebarLinkDataRole.BOTH:
              if (this._session.isLoggedIn()) {
                  this.navLinks.push(link);
              }
              break;
          default:
            break;
      }
    }
  }

  getRedirectUrlObject(base: String): any {
      if (this._session.getRole() === UserRole.ENDUSER) {
          return ['user', {outlets: { view: base }}];
      } else {
        return ['processor', {outlets: { view: base }}];
      }
  }

  buildSidebarNavLinkIconPath(relPath: string): string {
      return `../../../assets/${relPath}`;
  }
}
