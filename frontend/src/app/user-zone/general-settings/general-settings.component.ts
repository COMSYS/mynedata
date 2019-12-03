import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.css']
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {

  constructor(
    private _breadcrumbs: BreadcrumbsService,
    public locale: LocalizationService
  ) {
    this._breadcrumbs.moveDown({
      path: this.locale.get('general-settings-link-text-sidenav'),
      link: 'general-settings'
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._breadcrumbs.moveUp();
  }

}
