import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {RequestIssuerService} from '../../../core/services/request-issuer.service';
import {RequestIssuerType} from '../../../../config/requests-issuer-types.config';
import {FormGroup} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {PrivacyService} from '../../services/privacy.service';

@Component({
  selector: 'app-request-issuer-privacy',
  templateUrl: './request-issuer-privacy.component.html',
  styleUrls: ['./request-issuer-privacy.component.css']
})
export class RequestIssuerPrivacyComponent implements OnInit, OnDestroy {
  @Output() onChangeOnce = new EventEmitter<void>();
  private _hasChangedOnce: boolean = false;

  @Input() triggerSave$: Observable<void>;
  private _triggerSaveSubscription: Subscription;

  @Input() parentForm: FormGroup;
  @Input() formGroupName: string;
  public formGroup: FormGroup = new FormGroup({});

  constructor(
    private _reqIssuerService: RequestIssuerService,
    private _privacyService: PrivacyService
  ) { }

  ngOnInit() {
    if (this.parentForm && this.formGroupName) {
      this.parentForm.addControl(this.formGroupName, this.formGroup);
    }
    this._triggerSaveSubscription = this.triggerSave$.subscribe(this.save.bind(this));
  }

  ngOnDestroy(): void {
    this._triggerSaveSubscription.unsubscribe();
  }

  public getIssuerTypes(): RequestIssuerType[] {
    return this._reqIssuerService.getRequestIssuerTypes();
  }

  public onChange(): void {
    if (!this._hasChangedOnce) {
      this._hasChangedOnce = true;
      this.onChangeOnce.emit();
    }
  }

  public save(): void {
    this._hasChangedOnce = false;
    this._privacyService.setRequestissuerPermissions(this.formGroup.value);
  }

}
