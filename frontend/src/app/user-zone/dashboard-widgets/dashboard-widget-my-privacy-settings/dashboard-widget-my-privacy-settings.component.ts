import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {locale} from '../../../../locale/de_DE.locale';
import {LoggerService} from '../../../core/services/logger.service';
import {PrivacyService} from '../../services/privacy.service';
import {DataTypesService} from '../../../core/services/data-types.service';
import {DataType} from '../../../../config/data-types.config';
import {Observable, Subscription} from 'rxjs';
import {RequestIssuerType} from '../../../../config/requests-issuer-types.config';
import {RequestIssuerService} from '../../../core/services/request-issuer.service';

@Component({
  selector: 'app-dashboard-widget-my-privacy-settings',
  templateUrl: './dashboard-widget-my-privacy-settings.component.html',
  styleUrls: [
    './dashboard-widget-my-privacy-settings.component.css',
    '../dashboard-widgets.css'
  ]
})
export class DashboardWidgetMyPrivacySettingsComponent implements OnInit {
  public _datatypes: DataType[];
  public issuers: RequestIssuerType[];
  public authorizeDataSharing$: Observable<boolean>;


  constructor(
    public _locale: LocalizationService,
    private _logger: LoggerService,
    private _privacyService: PrivacyService,
    private _datatypeService: DataTypesService,
    private _issuerService: RequestIssuerService
  ) { }

  ngOnInit() {
    this._datatypes = this._datatypeService.getDataTypes();
    this.issuers = this._issuerService.getRequestIssuerTypes();
    this.authorizeDataSharing$ = this._privacyService.shouldExplicitlyAuthorizeDataUsage$();
  }

}
