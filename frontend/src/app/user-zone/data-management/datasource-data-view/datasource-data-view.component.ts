import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DateAdapter, MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {DatasourceService, DatasourceWrapper} from '../../services/datasource.service';
import {LocalizationService} from '../../../core/services/localization.service';
import {MatColumnDefModel} from '../../../../models/mat-column-def.model';
import {DataFromDatasourceApiResponseModel} from '../../../../models/api-response/data-from-datasource.api-response.model';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {ChartDatasourceName} from '../../../../config/charts.config';

@Component({
  selector: 'app-datasource-data-view',
  templateUrl: './datasource-data-view.component.html',
  styleUrls: ['./datasource-data-view.component.css']
})
export class DatasourceDataViewComponent implements OnInit, OnDestroy {
  private _matHeaderRow: string[] = [];
  private _matTableShownColumns: string[] = [];
 private _data: Promise<DataFromDatasourceApiResponseModel[]>;

  public formControlSelectedAttributesForChart: FormControl = new FormControl(this.getDatasourceAttributes());
  public formGroupTimeRange = new FormGroup({
    // today minus 2 weeks
    from: new FormControl(new Date(Date.now() - 12096e5)),
    // today
    until: new FormControl(new Date(Date.now())),
    filterTime: new FormControl(false)
  });
  public dateToday = new Date(Date.now());

  private _timeRangeValueChangeSubscription: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public matTableDataSource: MatTableDataSource<DataFromDatasourceApiResponseModel> = undefined;

  private _dataBehaviorSubject: BehaviorSubject<DataFromDatasourceApiResponseModel[]>;

  public  ChartDatasourceNameEnum = ChartDatasourceName;

  constructor(
    private _locale: LocalizationService,
    private _datasourceService: DatasourceService,
    @Inject(MAT_DIALOG_DATA) private data: {datasource: DatasourceWrapper},
    private dialogRef: MatDialogRef<DatasourceDataViewComponent>,
    private dateAdapter: DateAdapter<any>
  ) { }

  ngOnInit() {
    this._dataBehaviorSubject = new BehaviorSubject([]);
    this._loadTableData();
    // init datepicker adapter (locale), locale string has to be mutated from 'xx_XX' to 'xx-xx'
    this.dateAdapter.setLocale(this._locale.getLocale().toLowerCase().replace('_', '-'));

    this._timeRangeValueChangeSubscription = this.formGroupTimeRange.valueChanges.subscribe(() => {
      this.reloadTableData();
    });
  }

  ngOnDestroy(): void {
    this._timeRangeValueChangeSubscription.unsubscribe();
  }

  public getDataSubject(): Subject<DataFromDatasourceApiResponseModel[]> {
    return this._dataBehaviorSubject;
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public getMatHeaderRow(): string[] {
    return this._matHeaderRow;
  }

  public getMatTableShownColumns(): string [] {
    return this._matTableShownColumns;
  }

  public getMatColumnDefs(): MatColumnDefModel[] {
    const _headerRow: string[] = [];
    const _shownColumns: string[] = [];

    const columnDefs: MatColumnDefModel[] = [
      {
        name: 'date',
        header: this._locale.get('data-view-component-table-raw-data-date-header'),
        cell: dataRow => new Date(Number(dataRow.timestamp)).toLocaleDateString()
      },
      {
        name: 'time',
        header: this._locale.get('data-view-component-table-raw-data-time-header'),
        cell: dataRow => new Date(Number(dataRow.timestamp)).toLocaleTimeString()
      }
    ];
    _shownColumns.push('date', 'time');
    _headerRow.push('date', 'time');
    for (const attribute of this.data.datasource.privacy) {
      columnDefs.push({
        name: attribute.attribute,
        header: attribute.attribute,
        cell: dataRow => dataRow[attribute.attribute],
        sortable: true
      });
      _shownColumns.push(attribute.attribute);
      _headerRow.push(attribute.attribute);
    }
    this._matHeaderRow = _headerRow;
    this._matTableShownColumns = _shownColumns;
    return columnDefs;
  }

  public reloadTableData(): void {
    this._loadTableData(true);
  }

  private async _loadTableData(forceUpdate: boolean = false): Promise<void> {
    this.matTableDataSource = new MatTableDataSource(await this._getData(forceUpdate));
    this.matTableDataSource.paginator = this.paginator;
    this.matTableDataSource.sort = this.sort;
  }

  public getDatasource(): DatasourceWrapper {
    return this.data.datasource;
  }

  public getData(forceUpdate: boolean = false): Promise<DataFromDatasourceApiResponseModel[]> {
    return this._getData(forceUpdate);
  }

  private _getData(forceUpdate: boolean = false): Promise<DataFromDatasourceApiResponseModel[]> {
    if (forceUpdate || !this._data) {
      this._data = this._datasourceService.getDataFromDatasource(this.data.datasource.name, this.formGroupTimeRange.controls['from'].value, this.formGroupTimeRange.controls['until'].value).then(data => {
        this._dataBehaviorSubject.next(data);
        return data;
      });
    }
    return this._data;
  }

  public getDatasourceAttributes(): string[] {
    const _return = [];
    for (const attr of this.data.datasource.privacy) {
      _return.push(attr.attribute);
    }
    return _return;
  }

  public closeDataView(): void {
    this.dialogRef.close();
  }

  public isSource(name: ChartDatasourceName): boolean {
    return this.getDatasource().name === ChartDatasourceName[name].toLowerCase();
  }
}
