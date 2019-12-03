import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DataType, datatypesConfigs} from '../../../../../config/data-types.config';
import {PrivacyService} from '../../../services/privacy.service';
import {privacyConfig} from '../../../../../config/privacy.config';
import {LocalizationService} from '../../../../core/services/localization.service';
import {ToastService} from '../../../../core/services/toast.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-toggle-datatype-sharing',
  templateUrl: './toggle-datatype-sharing.component.html',
  styleUrls: ['./toggle-datatype-sharing.component.css']
})
export class ToggleDatatypeSharingComponent implements OnInit, OnDestroy {
  @Input() datatype: DataType;

  public isToggled: boolean = false; // default value before the actual value gets requested
  private _subscription: Subscription;

  constructor(
    private _privacyService: PrivacyService,
    private _locale: LocalizationService,
    private _toastService: ToastService
  ) { }

  async ngOnInit() {
    const _privacy$ = await this._privacyService.watchDataTypePrivacy$(this.datatype.id);
    this._subscription = _privacy$.subscribe(privacy => this.isToggled = !(privacy === privacyConfig.none));
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  public toggle(): void {
    this.isToggled = !this.isToggled;
    this._privacyService.setDatatypePrivacy(this.datatype.id, this.isToggled ? privacyConfig.max : privacyConfig.none);
    this._toastService.showToast('\'' + this._locale.get(this.datatype.nameLocaleIdentifier) + '\' ' + this._locale.get(`dashboard-widget-my-privacy-settings-toast-datatype-${this.isToggled ? 'en' : 'dis'}abled`));
  }

  public getTooltipText(): string {
    return this._locale.get(this.datatype.nameLocaleIdentifier);
  }

}
