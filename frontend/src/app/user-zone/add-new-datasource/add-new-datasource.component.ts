import {Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {LocalizationService} from '../../core/services/localization.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {Datasource, DatasourceService, DatasourceWrapper} from '../services/datasource.service';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {SessionService} from '../../core/services/session.service';
import {PrivacyService} from '../services/privacy.service';
import {DataTypesService} from '../../core/services/data-types.service';
import {DataType, DataTypes} from '../../../config/data-types.config';
import {privacyConfig} from '../../../config/privacy.config';
import {AvailableDatasourceApiResponseModel} from '../../../models/api-response/available-datasource.api-response.model';
import {isNull} from 'util';
import {DatasourceAttributeModel} from '../../../models/api-response/datasource-attribute.model';
import {GranularityConfig} from '../../../config/granularity.config';
import {DATASOURCE_TIME_UNIT} from '../../core/services/upload-granularity.service';

export interface AddNewDatasourceDialogResult {
  hasAddedDatasource?: boolean;
}

@Component({
  selector: 'app-add-new-datasource',
  templateUrl: './add-new-datasource.component.html',
  styleUrls: ['./add-new-datasource.component.css']
})
export class AddNewDatasourceComponent implements OnInit {
  @Input() hideAddButton: boolean = false;
  @Output() eventEmitter: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @ViewChild('addDataSourceForm') addDataSourceForm: NgForm;

  public formGroupDatasourceParameters: FormGroup;
  readonly _globalPrivacySetting: number;
  private _previouslyChosenDataType: DataTypes;
  private _forceManualPrivacy: boolean;

  public formGroupAttributesPrivacy: FormGroup;

  public hasChosenDatasource: boolean;
  public hasChangedDatasourceSelection: boolean;

  public noMoreDatasourcesAvailable: boolean;

  private _availableDatasourcesList: Promise<AvailableDatasourceApiResponseModel[]>;

  public currentlySelectedDatasource: AvailableDatasourceApiResponseModel;

  public granularityConfig = GranularityConfig;

  constructor(
      private _locale: LocalizationService,
      private dialogRef: MatDialogRef<AddNewDatasourceComponent>,
      @Inject(MAT_DIALOG_DATA) private passedDataIfUsedAsComponent,
      private _datasourceService: DatasourceService,
      private _formBuilder: FormBuilder,
      private _session: SessionService,
      private _privacy: PrivacyService,
      private _datatypes: DataTypesService
  ) {
    this._globalPrivacySetting = this._privacy.getGlobalPrivacy();
    this._forceManualPrivacy = false;
    this.hasChosenDatasource = false;
    this.hasChangedDatasourceSelection = false;
    this.noMoreDatasourcesAvailable = false;

    this._fetchAvailableDatasources();
  }

  ngOnInit() {
    this.formGroupDatasourceParameters = this._formBuilder.group({
      frequency: [1, Validators.required],
      unitOfTime: ['', Validators.required],
      dataSource: [null, Validators.required]
    });

    this.eventEmitter.emit(this.formGroupDatasourceParameters);
  }

  /**
   * Evaluates the input and chosen parameters and calls the datasource service to add the given datasource
   */
  public addDatasource(): void {
    const formInputDatasource = this.formGroupDatasourceParameters.value as {
        dataSource: AvailableDatasourceApiResponseModel,
        frequency: number,
        unitOfTime: number
      };
    const datasourceObject: DatasourceWrapper = {
      name: formInputDatasource.dataSource.data_source_name,
      frequency: formInputDatasource.frequency,
      unitOfTime: formInputDatasource.unitOfTime,
      id: formInputDatasource.dataSource.data_source_id
    };
    this._datasourceService.registerDatasource(datasourceObject);
    if (this.dialogRef) {
      const _result: AddNewDatasourceDialogResult = {hasAddedDatasource: true};
      this.dialogRef.close(_result);
    }
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

  public getDatatypes(): DataType[] {
    return this._datatypes.getDataTypes();
  }

  public hasChosenDataSource(): boolean {
    return !isNull(this.formGroupDatasourceParameters.value['dataSource']) && !isNull(this.currentlySelectedDatasource);
  }

  public onChangedDataType(): void {
    this.formGroupDatasourceParameters.patchValue({
      privacy: this._datatypes.getPrivacy(Number(this.formGroupDatasourceParameters.value['dataType'])),
    });
  }

  public getMaxPrivacy(): number {
    return this._privacy.getMaxPrivacy();
  }

  public getMinPrivacy(): number {
    return this._privacy.getMinPrivacy();
  }

  public toggleForceManualPrivacy(): void {
    this._forceManualPrivacy = !this._forceManualPrivacy;
  }

  public forcedManualPrivacy(): boolean {
    return this._forceManualPrivacy;
  }

  public getAvailableDatasources(): Promise<AvailableDatasourceApiResponseModel[]> {
    return this._availableDatasourcesList;
  }

  private _fetchAvailableDatasources(): void {
    this._availableDatasourcesList = this._datasourceService.getAvailableDatasourcesList();
  }

  private _getIdOfCurrentlySelectedDatasource(): number {
    return this.currentlySelectedDatasource.data_source_id;
  }

  private _getDatatypeIdsOfCurrentlySelectedDatasource(): DataTypes[] {
    const dataTypeObjectsOfCurrentlySelectedDatasource = this.currentlySelectedDatasource.data_source_attributes;
    const dataTypeIdsOfCurrentlySelectedDatasource: DataTypes[] = [];
    for (const type of dataTypeObjectsOfCurrentlySelectedDatasource) {
      dataTypeIdsOfCurrentlySelectedDatasource.push(type.datatype);
    }
    return dataTypeIdsOfCurrentlySelectedDatasource;
  }

  public print(identifier: string): string {
    return this._locale.get(identifier);
  }

  public getDataTypeObjects(): DataType[] {
    const result: DataType[] = [];
    for (const attribute of this.currentlySelectedDatasource.data_source_attributes) {
      result.push(this._datatypes.getDataTypeById(attribute.datatype));
    }
    return result;
  }

  public selectDatasource(ds: AvailableDatasourceApiResponseModel): void {
    if (!this.hasChangedDatasourceSelection) {
      return;
    }
    this.currentlySelectedDatasource = ds;
    this.hasChosenDatasource = true;
    this.hasChangedDatasourceSelection = false;
  }

  public printDatatypeState(isEnabled: boolean): string {
    if (isEnabled) {
      return this._locale.get('privacy-settings-enabled-sharing-of-data-of-datatype-text');
    } else {
      return this._locale.get('privacy-settings-disabled-sharing-of-data-of-datatype-text');
    }
  }

  public toggleDatatype(datatypeId: DataTypes, toBeEnabled: boolean): void {
    if (toBeEnabled) {
      this.formGroupAttributesPrivacy.patchValue({
        [datatypeId]: privacyConfig.max
      });
    } else {
      this.formGroupAttributesPrivacy.patchValue({
        [datatypeId]: privacyConfig.none
      });
    }
  }

  public async isInitiallyToggled(id: DataTypes): Promise<boolean> {
    return (await this._privacy.getDatatypePrivacy(id)) !== privacyConfig.none;
  }

}
