import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RequestsService} from '../../core/services/requests.service';
import {AddNewDatasourceComponent} from '../../user-zone/add-new-datasource/add-new-datasource.component';
import {Subscription} from 'rxjs';
import {LocalizationService} from '../../core/services/localization.service';
import {DetailsPinQueryDialogComponent} from '../../user-zone/dashboard-widgets/dashboard-widget-new-service/details-pin-query-dialog/details-pin-query-dialog.component';
import {DialogRegisterNewQueryComponent} from './dialog-register-new-query/dialog-register-new-query.component';
import {MatButtonToggle, MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {PinQueryInfoApiResponseModel} from '../../../models/api-response/pin-query-info.api-response.model';
import {RequestApiResponseModel} from '../../../models/api-response/request.api-response.model';
import {QueryInfoDialogComponent} from './query-info-dialog/query-info-dialog.component';
import * as Moment from 'moment';
import {extendMoment} from 'moment-range';

const moment = extendMoment(Moment);

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatButtonToggle) selectedQueryType: MatButtonToggle;

  private _refRegisterNewQuery: MatDialogRef<DialogRegisterNewQueryComponent>;
  private _refRegisterNewQueryAfterClosedSubscription: Subscription;
  // public queries
  public matTablePendingQueries: MatTableDataSource<RequestApiResponseModel> = undefined;
  public matTableCompletedQueries: MatTableDataSource<RequestApiResponseModel> = undefined;
  public matTableAbortedQueries: MatTableDataSource<RequestApiResponseModel> = undefined;
  public matTablePaidQueries: MatTableDataSource<RequestApiResponseModel> = undefined;
  // pin queries
  public matTablePendingPinQueries: MatTableDataSource<RequestApiResponseModel> = undefined;
  public matTableCompletedPinQueries: MatTableDataSource<RequestApiResponseModel> = undefined;
  public matTableAbortedPinQueries: MatTableDataSource<RequestApiResponseModel> = undefined;

  private _refQueryInfoDialog: MatDialogRef<QueryInfoDialogComponent>;
  private _queryInfoDialogAfterClosed: Subscription;

  private _headers = ['title', 'query', 'interval_finish_time', 'query_id'];

  constructor(
    private _dialogRegisterNewQuery: MatDialog,
    private _reqServ: RequestsService,
    private _queryInfoDialog: MatDialog,
    private _locale: LocalizationService,
  ) { }

  ngOnInit() {
    this._loadTableData();
  }

  ngOnDestroy(): void {
    if (this._refRegisterNewQueryAfterClosedSubscription) {
      this._refRegisterNewQueryAfterClosedSubscription.unsubscribe();
    }
    if (this._queryInfoDialogAfterClosed) {
      this._queryInfoDialogAfterClosed.unsubscribe();
    }
  }

  public openDialog(): void {
    this._openDialogRegisterNewQuery();
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  private _openDialogRegisterNewQuery(data?: Object): void {
    this._refRegisterNewQuery = this._dialogRegisterNewQuery.open(DialogRegisterNewQueryComponent, {
      data: {
      },
      width: '80%'
    });

    this._refRegisterNewQueryAfterClosedSubscription = this._refRegisterNewQuery.afterClosed().subscribe(() => {
    });
  }

  private async _loadTableData(): Promise<void> {
    this.matTablePendingQueries = new MatTableDataSource(await this.getPendingQueries());
    this.matTablePendingQueries.paginator = this.paginator;
    this.matTablePendingQueries.sort = this.sort;

    this.matTableCompletedQueries = new MatTableDataSource(await this.getCompletedQueries());
    this.matTableCompletedQueries.paginator = this.paginator;
    this.matTableCompletedQueries.sort = this.sort;

    this.matTableAbortedQueries = new MatTableDataSource(await this.getAbortedQueries());
    this.matTableAbortedQueries.paginator = this.paginator;
    this.matTableAbortedQueries.sort = this.sort;

    this.matTablePaidQueries = new MatTableDataSource(await this.getPaidQueries());
    this.matTablePaidQueries.paginator = this.paginator;
    this.matTablePaidQueries.sort = this.sort;

    this.matTablePendingPinQueries = new MatTableDataSource(await this.getPendingPinQueries());
    this.matTablePendingPinQueries.paginator = this.paginator;
    this.matTablePendingPinQueries.sort = this.sort;

    this.matTableCompletedPinQueries = new MatTableDataSource(await this.getCompletedPinQueries());
    this.matTableCompletedPinQueries.paginator = this.paginator;
    this.matTableCompletedPinQueries.sort = this.sort;

    this.matTableAbortedPinQueries = new MatTableDataSource(await this.getAbortedPinQueries());
    this.matTableAbortedPinQueries.paginator = this.paginator;
    this.matTableAbortedPinQueries.sort = this.sort;
  }

  public async getPendingQueries(): Promise<RequestApiResponseModel[]> {
    const query_ids: RequestApiResponseModel[] = await this._reqServ.getProcessorPendingQueries();
    const waitForIt: Promise<RequestApiResponseModel>[] = [];
    for (const id of query_ids) {
      waitForIt.push(this._reqServ.getQueryInfo(id.query_id));
    }
    return Promise.all(waitForIt);
  }

  public async getCompletedQueries(): Promise<RequestApiResponseModel[]> {
    const query_ids: RequestApiResponseModel[] = await this._reqServ.getProcessorCompletedQueries();
    const waitForIt: Promise<RequestApiResponseModel>[] = [];
    for (const id of query_ids) {
      waitForIt.push(this._reqServ.getQueryInfo(id.query_id));
    }
    return Promise.all(waitForIt);
  }

  public async getAbortedQueries(): Promise<RequestApiResponseModel[]> {
    const query_ids: RequestApiResponseModel[] = await this._reqServ.getProcessorAbortedQueries();
    const waitForIt: Promise<RequestApiResponseModel>[] = [];
    for (const id of query_ids) {
      waitForIt.push(this._reqServ.getQueryInfo(id.query_id));
    }
    return Promise.all(waitForIt);
  }

  public async getPaidQueries(): Promise<RequestApiResponseModel[]> {
    const query_ids: RequestApiResponseModel[] = await this._reqServ.getProcessorPaidQueries();
    const waitForIt: Promise<RequestApiResponseModel>[] = [];
    for (const id of query_ids) {
      waitForIt.push(this._reqServ.getQueryInfo(id.query_id));
    }
    return Promise.all(waitForIt);
  }

  public async getPendingPinQueries(): Promise<RequestApiResponseModel[]> {
    const query_ids: RequestApiResponseModel[] = await this._reqServ.getProcessorPendingPinQueries();
    const waitForIt: Promise<RequestApiResponseModel>[] = [];
    return Promise.all(waitForIt);
  }

  public async getCompletedPinQueries(): Promise<RequestApiResponseModel[]> {
    const query_ids: RequestApiResponseModel[] = await this._reqServ.getProcessorCompletedPinQueries();
    const waitForIt: Promise<RequestApiResponseModel>[] = [];
    return Promise.all(waitForIt);
  }

  public async getAbortedPinQueries(): Promise<RequestApiResponseModel[]> {
    const query_ids: RequestApiResponseModel[] = await this._reqServ.getProcessorAbortedPinQueries();
    const waitForIt: Promise<RequestApiResponseModel>[] = [];
    return Promise.all(waitForIt);
  }

  public openQueryInfoDialog(pendingRequest: RequestApiResponseModel): void {
    this._refQueryInfoDialog = this._queryInfoDialog.open(QueryInfoDialogComponent, {
      data: pendingRequest
    });

    this._queryInfoDialogAfterClosed = this._queryInfoDialog.afterAllClosed.subscribe(() => {
    });
  }

  public getMatHeaderRow(): string[] {
    return this._headers;
  }

  public getMatTableShownColumns(): string[] {
    return this._headers;
  }

  public showAsDateString(timestamp: string): string {
    return moment(Number(timestamp)).format('D.M.YY, HH:mm:ss');
  }

}
