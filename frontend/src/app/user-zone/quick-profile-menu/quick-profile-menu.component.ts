import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../core/services/localization.service';
import {SessionService} from '../../core/services/session.service';

@Component({
  selector: 'app-quick-profile-menu',
  templateUrl: './quick-profile-menu.component.html',
  styleUrls: ['./quick-profile-menu.component.css']
})
export class QuickProfileMenuComponent implements OnInit {
  public menuVisible: boolean;

  constructor(public locale: LocalizationService, private _session: SessionService) {
    this.menuVisible = false;
  }

  ngOnInit() {
  }

  openMenu() {
    this.menuVisible = true;
  }

  closeMenu() {
      this.menuVisible = false;
  }

  invokeLogout() {
    this._session.destroySession();
  }

}
