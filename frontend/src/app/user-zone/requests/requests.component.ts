import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';
import {RequestsService} from '../../core/services/requests.service';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {RequestIssuerService} from '../../core/services/request-issuer.service';
import {RegisteredIssuerApiResponseModel} from '../../../models/api-response/registered-issuer.api-response.model';
import {SelectionModel} from '@angular/cdk/collections';
import {RequestViewComponent, RequestViewComponentOptions} from './request-view/request-view.component';
import {ScoreService} from '../services/score.service';
import {isNull, isNumber} from 'util';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {RequestInternalRepresentationModel} from '../../../models/internal-representation/request.internal-representation.model';
import {RequestIssuerTypes} from '../../../config/requests-issuer-types.config';

interface AdditionalRequestData {
  processorObject: RegisteredIssuerApiResponseModel;
}

interface FetchedRequests {
  available: Promise<EnrichedRequestModel[]>;
  active: Promise<EnrichedRequestModel[]>;
  completed: Promise<EnrichedRequestModel[]>;
  declined: Promise<EnrichedRequestModel[]>;
}

export type EnrichedRequestModel = RequestInternalRepresentationModel & AdditionalRequestData;

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public matTableDataSourceAvailableRequests: MatTableDataSource<EnrichedRequestModel> = undefined;
  public matTableSelectionAvailableRequests = new SelectionModel(false, []);

  public matTableDataSourceParticipatedInCompletedRequests: MatTableDataSource<EnrichedRequestModel> = undefined;
  public matTableDataSourceDeclinedRequests: MatTableDataSource<EnrichedRequestModel> = undefined;

  private _headers = ['issuer', 'title', 'reward'];

  public numberOfPendingRequests$: Observable<number>;

  private _fetchedRequests: FetchedRequests = {
    available: null,
    active: null,
    completed: null,
    declined: null
  };

  constructor(
    private _breadcrumbs: BreadcrumbsService,
    private _locale: LocalizationService,
    private _reqServ: RequestsService,
    private _reqIssServ: RequestIssuerService,
    private _dialogRequestView: MatDialog,
    private _scoreService: ScoreService,
    private _route: ActivatedRoute
  ) {
    this._breadcrumbs.moveDown({
      path: this._locale.get('requests-link-text-sidenav'),
      link: 'requests'
    });
    this._initObservables();
  }

  ngOnInit() {
    this._loadTableData();
    if (this._hasViewParam()) {
      this._reqServ.getRequestById(this._getViewParam()).then((req: EnrichedRequestModel) => {
        this._reqIssServ.getIssuerById(req.processorId).then(issuer => {
          req.processorObject = issuer;
          this.openRequest(req);
        });
      });
    }
  }

  ngOnDestroy() {
    this._breadcrumbs.moveUp();
  }

  private async _initObservables(): Promise<void> {
    this.numberOfPendingRequests$ = this._reqServ.getNumberOfPendingRequests$();
  }

  public openRequest(req: EnrichedRequestModel) {
    this._openDialogRequestView(req);
  }

  private async _loadTableData(): Promise<void> {
    this.matTableDataSourceAvailableRequests = new MatTableDataSource(await this.getAvailableRequests());
    this.matTableDataSourceAvailableRequests.paginator = this.paginator;
    this.matTableDataSourceAvailableRequests.sort = this.sort;

    this.matTableDataSourceParticipatedInCompletedRequests = new MatTableDataSource(await this.getCompletedRequests());
    this.matTableDataSourceParticipatedInCompletedRequests.paginator = this.paginator;
    this.matTableDataSourceParticipatedInCompletedRequests.sort = this.sort;

    this.matTableDataSourceDeclinedRequests = new MatTableDataSource(await this.getDeclinedRequests());
    this.matTableDataSourceDeclinedRequests.paginator = this.paginator;
    this.matTableDataSourceDeclinedRequests.sort = this.sort;
  }

  public getMatHeaderRow(): string[] {
    return this._headers;
  }

  public getMatTableShownColumns(): string[] {
    return this._headers;
  }

  private async _appendIssuerData(request: RequestInternalRepresentationModel): Promise<void> {
    let additionalData: AdditionalRequestData;
    switch (request.processorId) {
      case 663512785314761886:
        additionalData = {
          processorObject: {
            id: -1,
            name: 'Uniklinik Muserhausen',
            industryBranch: RequestIssuerTypes.SCIENCE,
            locatedIn: {
              cityName: 'Musterhausen',
            }
          }
        };
        break;
      case 863054729877258116:
        additionalData = {
          processorObject: {
            id: -2,
            name: 'Lehrstuhl CommScience',
            industryBranch: RequestIssuerTypes.SCIENCE,
            websiteUrl: 'http://www.comm.rwth-aachen.de',
            locatedIn: {
              cityName: 'Aachen',
            }
          }
        };
        break;
      case 1024261929676390166:
        additionalData = {
          processorObject: {
            id: -3,
            name: 'Dialego',
            industryBranch: RequestIssuerTypes.GERMAN_EU_COMPANY,
            websiteUrl: 'https://web.dialego.de/',
            locatedIn: {
              cityName: 'Aachen',
            }
          }
        };
        break;
      case 1125758754083314502:
        additionalData = {
          processorObject: {
            id: -4,
            name: 'Your Home',
            industryBranch: RequestIssuerTypes.GERMAN_EU_COMPANY,
            locatedIn: {
              cityName: 'Erkelenz',
            }
          }
        };
        break;
      default:
        additionalData = {
          processorObject: {
            id: -1,
            name: 'Mock Processor',
            industryBranch: RequestIssuerTypes.SCIENCE,
            websiteUrl: 'comsys.rwth-aachen.de',
            locatedIn: {
              cityName: 'Aachen',
            }
          }
        };
    }
    Object.assign(request, additionalData);
  }

  public async getAvailableRequests(): Promise<EnrichedRequestModel[]> {
    if (!this._fetchedRequests.available) {
      const requests: RequestInternalRepresentationModel[] = await this._reqServ.getAvailableRequests();
      const waitForIt: Promise<any>[] = [];
      for (const req of requests) {
        waitForIt.push(this._appendIssuerData(req));
      }
      await Promise.all(waitForIt);
      this._fetchedRequests.available = Promise.resolve(requests as EnrichedRequestModel[]);
    }
    return this._fetchedRequests.available;
  }

  public async getDeclinedRequests(): Promise<EnrichedRequestModel[]> {
    if (!this._fetchedRequests.declined) {
      const requests: RequestInternalRepresentationModel[] = await this._reqServ.getDeclinedRequests();
      const waitForIt: Promise<any>[] = [];
      for (const req of requests) {
        waitForIt.push(this._appendIssuerData(req));
      }
      await Promise.all(waitForIt);
      this._fetchedRequests.declined = Promise.resolve(requests as EnrichedRequestModel[]);
    }
    return this._fetchedRequests.declined;
  }

  public async getCompletedRequests(): Promise<EnrichedRequestModel[]> {
    if (!this._fetchedRequests.completed) {
      const requests: RequestInternalRepresentationModel[] = await this._reqServ.getCompletedRequests();
      const waitForIt: Promise<any>[] = [];
      for (const req of requests) {
        waitForIt.push(this._appendIssuerData(req));
      }
      await Promise.all(waitForIt);
      this._fetchedRequests.completed = Promise.resolve(requests as EnrichedRequestModel[]);
    }
    return this._fetchedRequests.completed;
  }

  private _openDialogRequestView(request: EnrichedRequestModel): void {
    const _reqViewCompOpts: RequestViewComponentOptions = {
      request: request,
      reloadLocalRequestsBuffer: this.reloadTableData.bind(this)
    };
    const dialogRef = this._dialogRequestView.open(RequestViewComponent, {
      data: _reqViewCompOpts,
      width: '500px'
    });
  }

  public printReward(reward: number | string): string {
    if (isNumber(reward)) {
      return this._scoreService.getScoreWithName(reward as number);
    } else {
      return reward as string;
    }
  }

  private _resetTableData(): void {
    this.matTableDataSourceAvailableRequests = undefined;
    this.matTableDataSourceParticipatedInCompletedRequests = undefined;
    this.matTableDataSourceDeclinedRequests = undefined;
  }

  public async reloadTableData(): Promise<void> {
    this._resetFetchedRequests();
    this._resetTableData();
    await this._loadTableData();
    return Promise.resolve();
  }

  private _resetFetchedRequests(): void {
    for (const key in this._fetchedRequests) {
      this._fetchedRequests[key] = null;
    }
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  private _hasViewParam(): boolean {
    const _param = this._route.snapshot.queryParamMap.get('view');
    return !isNull(_param) && isNumber(Number(_param)); // strings will be casted to NaN
  }

  private _getViewParam(): number {
    return Number(this._route.snapshot.queryParamMap.get('view'));
  }
}
