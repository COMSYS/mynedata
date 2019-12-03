import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {EnrichedRequestModel} from '../requests.component';
import {RegisteredIssuerApiResponseModel} from '../../../../models/api-response/registered-issuer.api-response.model';
import {RequestIssuerService} from '../../../core/services/request-issuer.service';
import {LocalizationService} from '../../../core/services/localization.service';
import {RequestIssuerType} from '../../../../config/requests-issuer-types.config';
import {DataTypesService} from '../../../core/services/data-types.service';
import {isNumber} from 'util';
import {DATASOURCE_TIME_UNIT} from '../../../core/services/upload-granularity.service';
import {ScoreService} from '../../services/score.service';
import {RequestsService} from '../../../core/services/requests.service';
import {ToastService} from '../../../core/services/toast.service';
import {RequestStateEnum} from '../../../../config/requests.config';
import * as Moment from 'moment';
import {extendMoment} from 'moment-range';

const moment = extendMoment(Moment);

interface FetchedDatatypeInfo {
  name: string;
  iconPath: string;
  isDetailsExpanded: boolean;
}

interface FetchedDatatypes {
  [key: number]: FetchedDatatypeInfo;
}

export interface RequestViewComponentOptions {
  request: EnrichedRequestModel;
  reloadLocalRequestsBuffer: () => void;
}

@Component({
  selector: 'app-request-view',
  templateUrl: './request-view.component.html',
  styleUrls: ['./request-view.component.css']
})
export class RequestViewComponent implements OnInit {
  private _requestIssuerType: RequestIssuerType;

  private _datatypes: FetchedDatatypes = {};

  private _isDescriptionExpanded = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: RequestViewComponentOptions,
    private _reqIssService: RequestIssuerService,
    private _locale: LocalizationService,
    private _datatypeServ: DataTypesService,
    private _scoreService: ScoreService,
    private _reqService: RequestsService,
    private _dialogRef: MatDialogRef<RequestViewComponent>,
    private _toastService: ToastService
  ) { }

  ngOnInit() {
  }

  public getRequest(): EnrichedRequestModel {
    return this.data.request;
  }

  public getProcessor(): RegisteredIssuerApiResponseModel {
    return this.data.request.processorObject;
  }

  public printIssuerTypeName(): string {
    return this._locale.get(this.getRequestIssuerType().nameLocaleIdentifier);
  }

  public getIssuerTypeBranchIconPath(): string {
    return '../../../../assets/common/' + this.getRequestIssuerType().iconPath;
  }

  public getRequestIssuerType(): RequestIssuerType {
    if (!this._requestIssuerType) {
      this._requestIssuerType = this._reqIssService.getRequestIssuerTypeById(this.getRequest().processorObject.industryBranch);
    }
    return this._requestIssuerType;
  }

  public getIssuerLogoPath(): string {
    return '../../../../assets/mocks/' + this.getProcessor().logoUrl;
  }

  public getDatatypeIconPath(id: number): string {
    return this._getDatatypeInfo(id).iconPath;
  }

  public printDatatypeName(id: number): string {
    return this._getDatatypeInfo(id).name;
  }

  public isDetailsExpanded(id: number): boolean {
    return this._getDatatypeInfo(id).isDetailsExpanded;
  }

  public expandDetails(id: number): void {
    this._getDatatypeInfo(id).isDetailsExpanded = true;
  }

  public contractDetails(id: number): void {
    this._getDatatypeInfo(id).isDetailsExpanded = false;
  }

  private _getDatatypeInfo(id: number): FetchedDatatypeInfo {
    if (!this._datatypes[id]) {
      const dt = this._datatypeServ.getDataTypeById(id);
      this._datatypes[id] = {
        name: this._locale.get(dt.nameLocaleIdentifier),
        iconPath: '../../../../assets/common/' + dt.iconPath,
        isDetailsExpanded: false
      };
    }
    return this._datatypes[id];
  }

  public printDurationOfObservation(): string {
    const start = moment(this.data.request.intervalTime.start);
    const end = moment(this.data.request.intervalTime.end);
    const range = moment.range(start, end);
    const years = range.diff('years');
    let months = range.diff('months');

    let result = '';

    let yearsAsString = '';
    let monthsAsString = '';
    if (years > 0) { // if more than a year
      const gramNumberYears = (years === 1) ? 'singular' : 'plural';
      yearsAsString = `${years} ${this._locale.get(`add-datasource-granularity-time-scales-years-${gramNumberYears}`)}`;
      months = months - (years * 12);
      if (months > 0) { // if not exactly years, but also some months
        const gramNumberMonths = (months === 1) ? 'singular' : 'plural';
        monthsAsString = `${months} ${this._locale.get(`add-datasource-granularity-time-scales-months-${gramNumberMonths}`)}`;
        result = `${yearsAsString} ${this._locale.get('basic-and')} ${monthsAsString}`;
      } else { // if exact years, no months
        result = yearsAsString;
      }
    } else { // if less than a year
      const gramNumberMonths = (months === 1) ? 'singular' : 'plural';
      monthsAsString = `${months} ${this._locale.get(`add-datasource-granularity-time-scales-months-${gramNumberMonths}`)}`;
      result = monthsAsString;
    }

    return result;
  }

  public printDurationOfObservationAsDateToDate(): string {
    const start = moment(this.data.request.intervalTime.start);
    const end = moment(this.data.request.intervalTime.end);
    return `${start.format('D.M.Y')} - ${end.format('D.M.Y')}`;
  }

  public printReward(): string {
    if (isNumber(this.getRequest().reward)) {
      return this._scoreService.getScoreWithName(this.getRequest().reward as number);
    } else {
      return this.getRequest().reward as string;
    }
  }

  public isDescriptionExpanded(): boolean {
    return this._isDescriptionExpanded;
  }

  public expandDescription(): void {
    this._isDescriptionExpanded = true;
  }

  public contractDescription(): void {
    this._isDescriptionExpanded = false;
  }

  public async acceptRequest(): Promise<void> {
    await this._reqService.acceptRequest(this.getRequest());
    this._toastService.showToast(this._locale.get('request-accepted-toast'));
    this.data.reloadLocalRequestsBuffer();
    this._dialogRef.close();
    return Promise.resolve();
  }

  public async declineRequest(): Promise<void> {
    await this._reqService.declineRequest(this.getRequest());
    this._toastService.showToast(this._locale.get('request-declined-toast'));
    this.data.reloadLocalRequestsBuffer();
    this._dialogRef.close();
    return Promise.resolve();
  }

  public isPending(): boolean {
    return this.getRequest().requestState === RequestStateEnum.PENDING;
  }

  public isActive(): boolean {
    return this.getRequest().requestState === RequestStateEnum.ACTIVE;
  }

  public isFinished(): boolean {
    return this.getRequest().requestState === RequestStateEnum.FINISHED;
  }

  public isDeclined(): boolean {
    return this.getRequest().requestState === RequestStateEnum.DECLINED;
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public getQueryThumbnailPath(): string {
    return this.getRequest().thumbnailUrl;
  }
}
