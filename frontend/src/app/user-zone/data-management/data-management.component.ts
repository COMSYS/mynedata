import {Component, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';
import {DatasourceService, DatasourceWrapper} from '../services/datasource.service';
import {DataTypesService} from '../../core/services/data-types.service';
import {LoggerService} from '../../core/services/logger.service';
import {PrivacyService} from '../services/privacy.service';
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {DatasourcePrivacyApiResponseModel} from '../../../models/api-response/datasource-privacy.api-response.model';
import {privacyConfig} from '../../../config/privacy.config';
import {EditDatasourceComponent} from '../edit-datasource/edit-datasource.component';
import {DATASOURCE_TIME_UNIT} from '../../core/services/upload-granularity.service';
import {AdditionalDatasourcesMock} from '../../../mocks/additional-datasources.mock';
import {DatasourceDataViewComponent} from './datasource-data-view/datasource-data-view.component';
import {AddNewDatasourceComponent, AddNewDatasourceDialogResult} from '../add-new-datasource/add-new-datasource.component';
import {isNull, isUndefined} from 'util';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {_def} from '@angular/core/src/view/provider';
import {ChartDatasourceName} from '../../../config/charts.config';

export interface CustomPrivacyInfo {
  customDataTypes?: {
    [key: number]: {
      custom: number;
      default: number;
    }
  };
}

@Component({
  selector: 'app-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: [
    './data-management.component.css',
    '../user-zone.component.css'
  ]
})
export class DataManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private matHeaderRow = ['name', 'datatypes', 'uploadInterval', 'customPrivacy', 'edit', 'moreInfo', 'deregisterDatasource'];
  private matTableShownColumns = ['name', 'datatypes', 'uploadInterval', 'customPrivacy', 'edit', 'moreInfo', 'deregisterDatasource'];

  public matTableDataConnectedDatasources: MatTableDataSource<DatasourceWrapper> = undefined;
  private fullDataConnectedDatasources: Promise<DatasourceWrapper[]>;

  public tableInteractionAllowed = true;

  private _refAddNewDatasource: MatDialogRef<AddNewDatasourceComponent>;
  private _refAddNewDatasourceAfterClosedSubscription: Subscription;

  constructor(
    private _breadcrumbs: BreadcrumbsService,
    private _dsService: DatasourceService,
    private _dtService: DataTypesService,
    private _locale: LocalizationService,
    private _logger: LoggerService,
    private _privacyService: PrivacyService,
    private _dialogEditDatasource: MatDialog,
    private _dialogDataView: MatDialog,
    private addDatasourceDialog: MatDialog,
    private _route: ActivatedRoute
  ) {
    this._breadcrumbs.moveDown({
      path: this._locale.get('data-management-link-text-sidenav'),
      link: 'data-management'
    });

  }

  async ngOnInit() {
    this._initPullConnectedDatasources();
    this.fullDataConnectedDatasources.then((x) => {
      if (!this._dsService.hasAddedArbitraryTestDS) {
        for (const mock of AdditionalDatasourcesMock) {
          x.push(mock);
        }

        this._dsService.hasAddedArbitraryTestDS = true;
      }
      this._initTable();
    });
    if (this._hasParam('edit')) {
      this.editDatasource(await this._dsService.getDatasourceById(this._getParam('edit')));
    } else if (this._hasParam('show')) {
      this.showInfoForDatasource(await this._dsService.getDatasourceById(this._getParam('show')));
    }
  }

  ngOnDestroy() {
    this._breadcrumbs.moveUp();
    if (this._refAddNewDatasourceAfterClosedSubscription) {
      this._refAddNewDatasourceAfterClosedSubscription.unsubscribe();
    }
  }

  private async _initTable(): Promise<void> {
    await this._loadMatTableDataSource();
    this.matTableDataConnectedDatasources.sortingDataAccessor = this._customTableSorting.bind(this);
    this.matTableDataConnectedDatasources.paginator = this.paginator;
    this.matTableDataConnectedDatasources.sort = this.sort;
  }

  private async _loadMatTableDataSource(): Promise<void> {
    this.matTableDataConnectedDatasources = new MatTableDataSource(await this.fullDataConnectedDatasources);
  }

  private async _reloadMatTableDataSource(refetchFromApi: boolean = false): Promise<void> {
    this.fullDataConnectedDatasources = this._dsService.getRegisteredDatasources(refetchFromApi);
    await this.fullDataConnectedDatasources;
    this._processDatasourcesForCustomPrivacies();
    await this._loadMatTableDataSource();
  }

  private async _initPullConnectedDatasources(): Promise<void> {
    this.fullDataConnectedDatasources = this._dsService.getRegisteredDatasources(true);
    await this.fullDataConnectedDatasources;
    this._processDatasourcesForCustomPrivacies();
  }

  private _getFullArrayConnectedDatasources(): Promise<DatasourceWrapper[]> {
    return this.fullDataConnectedDatasources;
  }

  public getDatatypeName(localeIdentifier: string): string {
    return this._locale.get(localeIdentifier);
  }

  public buildLocalizedStringDataTypes(dataTypeIds: number[]): string {
    if (dataTypeIds) {
      let result = '';
      for (let i = 0; i < dataTypeIds.length; i++) {
        const dataType = this._dtService.getDataTypeById(dataTypeIds[i]);
        if (dataType) {
          result += this.getDatatypeName(dataType.nameLocaleIdentifier);
          if (i !== dataTypeIds.length - 1) {
            result += ', ';
          }
        } else {
          this._logger.print('data management component tried to get the localized name of a DataType, but the id is not known');
        }
      }
      return result;
    }
    console.log('datatype IDs array was empty, couldn\'t build a string');
    return '';

  }

  public getLocale(identifier: string): string {
    return this._locale.get(identifier);
  }

  public getMatHeaderRow() {
    return this.matHeaderRow;
  }

  public getMatTableShownColumns() {
    return this.matTableShownColumns;
  }

  public getPrivacyAsColorTooltip(privacy: number): string {
    return this._privacyService.getPrivacyAsColorTooltip(privacy);
  }

  public getPrivacySettingAsColor(privacy: number): Object {
    return this._privacyService.getPrivacySettingAsCssClass(privacy);
  }

  public async applyFilter(filterValue: string) {
    let result: DatasourceWrapper[];
    if (filterValue.toString().length > 0) {
      filterValue = filterValue.trim().toLowerCase();

      result = (await this._getFullArrayConnectedDatasources()).filter(item => {
        // check if filter input is text
        if (isNaN(Number(filterValue.toString()))) {
          // test name
          if (item.name.toLowerCase().indexOf(filterValue) !== -1) {
            return true;
          }

          // test data types
          for (const typeId of item.datatypes) {
            const dataTypeById = this._dtService.getDataTypeById(typeId);
            if (dataTypeById) {
              const localizedDataTypeName = this.getDatatypeName(dataTypeById.nameLocaleIdentifier).trim().toLowerCase();
              if (localizedDataTypeName.indexOf(filterValue) !== -1) {
                return true;
              }
            }
          }

          // test upload interval unit of time
          if (this.buildLocalizedStringUploadInterval(item.frequency, item.unitOfTime).toLowerCase().indexOf(filterValue) !== -1) {
            return true;
          }

        } else { // if it is a number instead

          // test privacy
          for (const singlePrivacy of item.privacy) {
            if (singlePrivacy.level === Number(filterValue)) {
              return true;
            }
          }

          // test upload frequency
          if (item.frequency === Number(filterValue)) {
            return true;
          }
        }

        // all possibilities were negative
        return false;
      });
    } else {
      // reset the filter by saying 'true' to every item in the list
      result = (await this._getFullArrayConnectedDatasources()).filter(() => true);
    }
    this.matTableDataConnectedDatasources = new MatTableDataSource(result);
  }

  public buildLocalizedStringUploadInterval(_frequency: number, unitOfTime: DATASOURCE_TIME_UNIT): string {
    let result = '';
    const numberOfSupportedUnitsOfTime = Object.keys(DATASOURCE_TIME_UNIT).length / 2;

    // check if the unitOfTime and the frequency are plausible
    if (unitOfTime < numberOfSupportedUnitsOfTime && _frequency >= 0) {
      let grammaticalNumber = 'plural';
      if (Number(_frequency) === 1) {
        grammaticalNumber = 'singular';
      }
      const localeIdentifier = `add-datasource-granularity-time-scales-${DATASOURCE_TIME_UNIT[unitOfTime]}-${grammaticalNumber}`;
      result = `${_frequency} ${this.getLocale(localeIdentifier)}`;
    } else {
      this._logger.print(`unitOfTime with id ${unitOfTime} was not found`);
    }
    return result;
  }

  private _customTableSorting(item: DatasourceWrapper, property): string|number {
    switch (property) {
      case 'uploadInterval': return this._convertUploadIntervalToSeconds(item.frequency, item.unitOfTime);
      case 'privacy': return this._calcPrivacyForSorting(item.privacy);
      default: return item[property];
    }
  }

  private _convertUploadIntervalToSeconds(_frequency: number, unitOfTime: DATASOURCE_TIME_UNIT): number {
    // trusting that this function gets called when already checked if unitOfTime is plausible
    const timeInSeconds: Array<number> = [1, 60, 3600, 86400, 604800, 2629743, 31556926, 315569260, 3155692600, 31556926000];

    return _frequency * timeInSeconds[unitOfTime];
  }

  private _calcPrivacyForSorting(privacies: DatasourcePrivacyApiResponseModel[]): number {
    let sum = 0;
    for (const privacy of privacies) {
      if (privacy.level === 0) {
      } else {
        sum += privacy.level;
      }
    }
    return sum;
  }

  public editDatasource(ds: DatasourceWrapper & CustomPrivacyInfo): void {
    this._openDialogEditDatasource(ds);
  }

  public showInfoForDatasource(ds: DatasourceWrapper): void {
    if (!ds.mock) {
      this._openDialogDataView(ds);
    }
  }

  public async removeDatasource(ds: DatasourceWrapper): Promise<void> {
    if (!ds.mock) {
      await this._dsService.deregisterDatasource(ds.id);
      this._reloadMatTableDataSource();
    }
  }

  public buildStringShowingPrivacyLevels(privacies: DatasourcePrivacyApiResponseModel[]): string {
    let lowestPrivacy = privacyConfig.max;
    let highestPrivacy = privacyConfig.min;
    for (const privacy of privacies) {
      if (privacy.level < lowestPrivacy) {
        lowestPrivacy = privacy.level;
      }
      if (privacy.level > highestPrivacy) {
        highestPrivacy = privacy.level;
      }
    }
    if (lowestPrivacy === highestPrivacy) {
      return lowestPrivacy.toString();
    } else {
      return `${lowestPrivacy} - ${highestPrivacy}`;
    }
  }

  private _openDialogEditDatasource(ds: DatasourceWrapper & CustomPrivacyInfo): void {
    const _emitter = new EventEmitter<void>();
    const dialogRef = this._dialogEditDatasource.open(EditDatasourceComponent, {
      data: {
        datasource: ds,
        afterOpenEmitter: _emitter
      },
      width: '750px'
    });

    // thanks to https://github.com/angular-slider/angularjs-slider/issues/79#issuecomment-120848662 to have the right idea about recalcing size
    const x = dialogRef.afterOpen().subscribe(() => {
      _emitter.emit();
      x.unsubscribe();
    });

    const y = dialogRef.afterClosed().subscribe(ongoingTransactions => {
      if (ongoingTransactions) {
        ongoingTransactions.then(() => {
          this._reloadMatTableDataSource();
        });
      }
      y.unsubscribe();
    });
  }

  private _openDialogDataView(ds: DatasourceWrapper): void {
    const dialogRef = this._dialogDataView.open(DatasourceDataViewComponent, {
      data: {
        datasource: ds
      },
      width: '90%'
    });
  }

  public print(identifier: string): string {
    return this._locale.get(identifier);
  }

  public openAddDatasourceDialog(data?: Object): void {
    this._refAddNewDatasource = this.addDatasourceDialog.open(AddNewDatasourceComponent, {
      data: {
        passedData: data
      }
    });

    this._refAddNewDatasourceAfterClosedSubscription = this._refAddNewDatasource.afterClosed().subscribe(this._interpretDialogResults.bind(this));
  }

  private _hasParam(param: string): boolean {
    const _param = this._route.snapshot.queryParamMap.get(param);
    return !isNull(_param) && !isUndefined(_param); // strings will be casted to NaN
  }

  private _getParam(param: string): number {
    return Number(this._route.snapshot.queryParamMap.get(param));
  }

  private _interpretDialogResults(result?: AddNewDatasourceDialogResult): void {
    if (result) {
      if (result.hasAddedDatasource) {
        this._reloadMatTableDataSource();
      }
    }
  }

  private async _processDatasourcesForCustomPrivacies(): Promise<void> {
    const _defPrivacies = await this._privacyService.getDefaultPrivacies();
    const _pulledSources: (DatasourceWrapper & CustomPrivacyInfo)[] = await this.fullDataConnectedDatasources;
    for (const ds of _pulledSources) {
      for (const type of ds.privacy) {
        const _custom = type.level;
        const _default = _defPrivacies[type.dataTypeId];
        if (_custom !== _default) {
          if (!ds.customDataTypes) {
            ds.customDataTypes = {};
          }
          ds.customDataTypes[type.dataTypeId] = {
            custom: _custom,
            default: _default
          };
        }
      }
    }
  }

  public buildStringWhetherCustomPrivaciesAreSet(ds: DatasourceWrapper & CustomPrivacyInfo): string {
    if (ds.customDataTypes) {
      return 'yes';
    }
    return 'no';
  }
}
