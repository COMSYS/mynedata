import {AfterViewInit, Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DatasourceService, DatasourceWrapper} from '../services/datasource.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LocalizationService} from '../../core/services/localization.service';
import {GranularityConfig} from '../../../config/granularity.config';
import {DataType, DataTypes} from '../../../config/data-types.config';
import {DataTypesService} from '../../core/services/data-types.service';
import {privacyConfig} from '../../../config/privacy.config';
import {UpdatePrivacyDatasourceApiRequestModel} from '../../../models/api-request/update-privacy-datasource.api-request.model';
import {CustomPrivacyInfo} from '../data-management/data-management.component';

@Component({
  selector: 'app-edit-datasource',
  templateUrl: './edit-datasource.component.html',
  styleUrls: ['./edit-datasource.component.css']
})
export class EditDatasourceComponent implements OnInit, AfterViewInit {
  private _passedDatasource: DatasourceWrapper;
  private _dataTypeObjects: DataType[];
  private _initialFormValues;

  public formGroupDatasourceParameters: FormGroup;
  public granularityConfig = GranularityConfig;

  public afterDialogOpenEmitter: EventEmitter<void>;

  constructor(
    private dialogRef: MatDialogRef<EditDatasourceComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {datasource: DatasourceWrapper & CustomPrivacyInfo, afterOpenEmitter: EventEmitter<void>},
    private _formBuilder: FormBuilder,
    private _locale: LocalizationService,
    private _dataTypesService: DataTypesService,
    private _datasourceService: DatasourceService
  ) { }

  ngOnInit() {
    this._passedDatasource = this.data.datasource;
    this.afterDialogOpenEmitter = this.data.afterOpenEmitter;
    this.formGroupDatasourceParameters = this._formBuilder.group({
      frequency: [this._passedDatasource.frequency, Validators.required],
      unitOfTime: [this._passedDatasource.unitOfTime, Validators.required],
      dataSource: [this._passedDatasource.id, Validators.required]
    });

    this._initialFormValues = {
      frequency: this._passedDatasource.frequency,
      unitOfTime: this._passedDatasource.unitOfTime,
      dataSource: this._passedDatasource.id
    };

    // add the controls needed by the privacy slider
    for (const privacy of this._passedDatasource.privacy) {
      this.formGroupDatasourceParameters.addControl('dt_' + privacy.dataTypeId, new FormControl(privacy.level));
      this._initialFormValues['dt_' + privacy.dataTypeId] = privacy.level;
    }
  }

  ngAfterViewInit(): void {
    this.afterDialogOpenEmitter.emit();
  }

  private _editDatasource(): void {
    const _promisesToWaitForAfterDialogIsClosed: Promise<any>[] = [
      // this resolved promise is here to ensure that Promise.all() does not fail because the array is empty
      Promise.resolve()
    ];

    let _uploadIntervalHasChanged = false;
    let _privacyHasChanged = false;

    const val = this.formGroupDatasourceParameters.value;
    const init = this._initialFormValues;

    // check which kind of data has been changed
    if (
      val['frequency'] !== init.frequency ||
      val['unitOfTime'] !== init.unitOfTime
    ) {
      _uploadIntervalHasChanged = true;
    }
    for (const type of this._dataTypeObjects) {
      if (val['dt_' + type.id] !== init ['dt_' + type.id]) {
        _privacyHasChanged = true;
        break;
      }
    }

    // react to specific changes
    if (_privacyHasChanged) {
      const privacyObject: UpdatePrivacyDatasourceApiRequestModel = {
        privacy_settings: []
      };
      for (const type of this._passedDatasource.privacy) {
        privacyObject.privacy_settings.push({
          attribute: type.attribute,
          level: val['dt_' + type.dataTypeId]
        });
      }
      _promisesToWaitForAfterDialogIsClosed.push(this._datasourceService.updateDatasourcePrivacy(this._passedDatasource.id, privacyObject));
    }

    if (_uploadIntervalHasChanged) {
      _promisesToWaitForAfterDialogIsClosed.push(this._datasourceService.updateDatasourceUploadGranularity(this._passedDatasource.id, val['frequency'], val['unitOfTime']));
    }

    this.dialogRef.close(Promise.all(_promisesToWaitForAfterDialogIsClosed));
  }

  public editDatasource(): void {
    this._editDatasource();
  }

  public print(identifier: string): string {
    return this._locale.get(identifier);
  }

  /**
   * Builds a string based on the numerus
   * @param localeRef The locale identifier without the numerus appendix
   */
  public getTimeScaleAsText(localeRef: string): string {
    const _useSingular = this.formGroupDatasourceParameters.value['frequency'] === 1;
    if (_useSingular) {
      return this._locale.get(localeRef + '-singular');
    } else {
      return this._locale.get(localeRef + '-plural');
    }
  }

  public getDataTypeObjects(): DataType[] {
    // check for NULL or UNDEFINED
    if (this._dataTypeObjects == null) {
      const result: DataType[] = [];
      for (const privacy of this._passedDatasource.privacy) {
        const datatypeObject = this._dataTypesService.getDataTypeObjectWithPrivacyDifferentFromDefaultValue(privacy.dataTypeId, privacy.level);
        result.push(datatypeObject);
      }
      this._dataTypeObjects = result;
    }
    return this._dataTypeObjects;
  }

  public getMinPrivacy(): number {
    return privacyConfig.min;
  }

  public getMaxPrivacy(): number {
    return privacyConfig.max;
  }

  public getDefaultValueForDataType(dataTypeId: DataTypes): number {
    if (this.data.datasource.customDataTypes && this.data.datasource.customDataTypes[dataTypeId]) {
      return this.data.datasource.customDataTypes[dataTypeId].default;
    } else {
      for (const type of this.data.datasource.privacy) {
        if (type.dataTypeId === dataTypeId) {
          return type.level;
        }
      }
    }
  }
}
