import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PrivacyService} from '../../../services/privacy.service';
import {LocalizationService} from '../../../../core/services/localization.service';
import {ToastService} from '../../../../core/services/toast.service';
import {privacyConfig} from '../../../../../config/privacy.config';
import {DataType} from '../../../../../config/data-types.config';
import {RequestIssuerType} from '../../../../../config/requests-issuer-types.config';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-toggle-issuer-business-sharing',
  templateUrl: './toggle-issuer-business-sharing.component.html',
  styleUrls: ['./toggle-issuer-business-sharing.component.css']
})
export class ToggleIssuerBusinessSharingComponent implements OnInit, OnDestroy {
  @Input() issuer: RequestIssuerType;

  public isToggled: boolean = false; // default value before the actual value gets requested
  private _subscription: Subscription;

  constructor(
    private _privacyService: PrivacyService,
    private _locale: LocalizationService,
    private _toastService: ToastService
  ) { }

  async ngOnInit() {
    const _toggled$ = await this._privacyService.watchRequestIssuerPermission$(this.issuer.id)
    this._subscription = _toggled$.subscribe(toggled => this.isToggled = toggled);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  public toggle(): void {
    this._privacyService.setRequestissuerPermission(this.issuer.id, !(this.isToggled));
    this._toastService.showToast('\'' + this._locale.get(this.issuer.nameLocaleIdentifier) + '\' ' + this._locale.get(`dashboard-widget-my-privacy-settings-toast-issuer-${this.isToggled ? 'en' : 'dis'}abled`));
  }

  public getTooltipText(): string {
    return this._locale.get(this.issuer.nameLocaleIdentifier);
  }

}
