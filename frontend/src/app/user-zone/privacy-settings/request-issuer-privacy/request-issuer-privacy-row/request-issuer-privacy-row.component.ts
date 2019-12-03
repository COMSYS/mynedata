import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {RequestIssuerType} from '../../../../../config/requests-issuer-types.config';
import {LocalizationService} from '../../../../core/services/localization.service';
import {PrivacyService} from '../../../services/privacy.service';

@Component({
  selector: 'app-request-issuer-privacy-row',
  templateUrl: './request-issuer-privacy-row.component.html',
  styleUrls: ['./request-issuer-privacy-row.component.css']
})
export class RequestIssuerPrivacyRowComponent implements OnInit {
  @Input() parentFormGroup: FormGroup;
  @Input() requestIssuer: RequestIssuerType;

  @Output() onChange = new EventEmitter<void>();

  public hasFetchedPermission: Promise<boolean>;

  constructor(
    private _locale: LocalizationService,
    private _privacyService: PrivacyService
  ) { }

  async ngOnInit() {
    const _permission = this._privacyService.getRequestIssuerPermission(this.requestIssuer.id);
    this.hasFetchedPermission = _permission.then(() => true);
    this.parentFormGroup.addControl(this.requestIssuer.id.toString(), new FormControl(await _permission));
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

}
