import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataTypesService} from '../../../core/services/data-types.service';
import {PrivacyService} from '../../services/privacy.service';
import {DataType, DataTypes, datatypesConfigs} from '../../../../config/data-types.config';
import {privacyConfig} from '../../../../config/privacy.config';
import {LocalizationService} from '../../../core/services/localization.service';
import {Observable, Subscription} from 'rxjs';
import {MatSlider} from '@angular/material';
import {LoggerService} from '../../../core/services/logger.service';
import {DefaultPrivacyInternalRepresentationModel} from '../../../../models/internal-representation/default-privacy.internal-representation.model';

@Component({
  selector: 'app-data-types-privacy',
  templateUrl: './data-types-privacy.component.html',
  styleUrls: ['./data-types-privacy.component.css', './../privacy-settings.component.css']
})
export class DataTypesPrivacyComponent implements OnInit, OnDestroy {
  @Output() formGroupEmitter: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Input('suppress-auto-apply') suppressAutoApply: boolean;

  @Input('refresh-slider') refreshSlider: EventEmitter<void>;

  @Input('trigger-upload-observable') uploadTrigger$: Observable<void>;
  private _uploadTriggerSubscription: Subscription;

  @Output('changeOnce') _valuesHaveChangedOnceEmitter: EventEmitter<void> = new EventEmitter<void>();
  private _valuesHaveChangedOnce: boolean = false;
  @Output() changed = new EventEmitter<void>();

  @Input('parent-form') parentForm: FormGroup;
  @Input('form-group-name-in-parent-form') formControlInParentForm: string;

  @Output() fetchedDataTypesPrivacies = new EventEmitter<void>();

  public formGroup: FormGroup;

  private _dataTypesConfigs: DataType[];

  private _referencePrivacyConfiguration: Object;

  constructor(
      private _formBuilder: FormBuilder,
      private _dataTypesService: DataTypesService,
      private _privacy: PrivacyService,
      private _locale: LocalizationService,
      private _logger: LoggerService
  ) {
    this._dataTypesConfigs = _dataTypesService.getDataTypes();
  }

  async ngOnInit() {
    // if the subscription is triggered by the parent, then it has to upload the settings to the API
    this._uploadTriggerSubscription = this.uploadTrigger$.subscribe(() => this._uploadSettings.call(this));

    const builtFormBuilderOptions: Object = {};
    for (const dataType of this._dataTypesConfigs) {
        // the id field contains the numerical equivalent of the enum, so it maps the numbers accordingly
        builtFormBuilderOptions[dataType.id] = [await this._privacy.getDatatypePrivacy(dataType.id), Validators.required];
    }
    this.formGroup = this._formBuilder.group(builtFormBuilderOptions);
    if (this.parentForm && this.formControlInParentForm) {
      this.parentForm.addControl(this.formControlInParentForm, this.formGroup);
      this.fetchedDataTypesPrivacies.emit();
    }
    this._referencePrivacyConfiguration = Object.assign({}, this.formGroup.value);
  }

  ngOnDestroy() {
  }

  public getDataTypes(): DataType[] {
    return this._dataTypesConfigs;
  }

  public getMaxPrivacy(): number {
    return this._privacy.getMaxPrivacy();
  }

  public getMinPrivacy(): number {
    return this._privacy.getMinPrivacy();
  }

  public print(identifier: string): string {
    return this._locale.get(identifier);
  }

  private _uploadSettings(): void {
    const _tmp = Object.assign({}, this.formGroup.value);
    const adjustedFormValues = this._filterOutTypesThatHaveNotBeenChanged();
    this._privacy.setDatatypesPrivacies(adjustedFormValues).then(() => {
      this._referencePrivacyConfiguration = _tmp;
    });
    this._valuesHaveChangedOnce = false;
  }

  public onChange(): void {
    this.changed.emit();
    if (!this._valuesHaveChangedOnce) {
      this._valuesHaveChangedOnce = true;
      this._valuesHaveChangedOnceEmitter.emit();
    }
  }

  private _filterOutTypesThatHaveNotBeenChanged(): DefaultPrivacyInternalRepresentationModel {
    const formClone = Object.assign({}, this.formGroup.value);
    for (const key in formClone) {
      // just a safety check, if key exists on both objects
      if (formClone.hasOwnProperty(key) && this._referencePrivacyConfiguration.hasOwnProperty(key)) {
        // check if the value has NOT changed
        if (formClone[key] === this._referencePrivacyConfiguration[key]) {
          // if it has NOT changed, then remove the entry from the patch object to not overwrite custom privacy settings on sources
          delete formClone[key];
        }
      } else {
        this._logger.print('In DataTypesPrivacyComponent; _filterOutTypesThatHaveNotBeenChanged(); Tried do check a key that does not exist on at least one of them');
        return {};
      }
    }
    // when done iterating, the resulting object should be filled merely with the types that actually got changed
    return formClone;
  }
}
