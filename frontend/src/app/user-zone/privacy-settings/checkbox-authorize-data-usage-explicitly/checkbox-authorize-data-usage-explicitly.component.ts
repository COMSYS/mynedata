import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {PrivacyService} from '../../services/privacy.service';
import {Observable, Subscription} from 'rxjs';
import {LocalizationService} from '../../../core/services/localization.service';

@Component({
  selector: 'app-checkbox-authorize-data-usage-explicitly',
  templateUrl: './checkbox-authorize-data-usage-explicitly.component.html',
  styleUrls: ['./checkbox-authorize-data-usage-explicitly.component.css']
})
export class CheckboxAuthorizeDataUsageExplicitlyComponent implements OnInit {
  @Input('parent-form') parentForm: FormGroup;
  @Input('form-control-name-in-parent-form') formControlNameInParentForm: string;
  private _formControl: FormControl;

  @Output() onChange = new EventEmitter<void>();

  @Input('trigger-upload-observable') uploadTrigger$: Observable<void>;
  private _uploadTriggerSubscription: Subscription;

  constructor(
    private _privacyService: PrivacyService,
    private _locale: LocalizationService
  ) { }

  ngOnInit() {
    // if the subscription is triggered by the parent, then it has to upload the settings to the API
    this._uploadTriggerSubscription = this.uploadTrigger$.subscribe(() => this._saveSetting.call(this));

    this._formControl = new FormControl(this._privacyService.shouldExplicitlyAuthorizeDataUsage());

    this.parentForm.addControl(this.formControlNameInParentForm, this._formControl);
  }

  private _saveSetting(): void {
    this._privacyService.setExplicitAuthorizationOfDataUsage(this._formControl.value);
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

}
