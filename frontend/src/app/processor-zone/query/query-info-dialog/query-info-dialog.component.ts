import {Component, Inject, OnInit} from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {RequestApiResponseModel} from '../../../../models/api-response/request.api-response.model';
import {RequestsService} from '../../../core/services/requests.service';
import {ToastService} from '../../../core/services/toast.service';
import {environment} from '../../../../environments/environment';
import * as Moment from 'moment';
import {extendMoment} from 'moment-range';

const moment = extendMoment(Moment);

@Component({
  selector: 'app-query-info-dialog',
  templateUrl: './query-info-dialog.component.html',
  styleUrls: ['./query-info-dialog.component.css']
})
export class QueryInfoDialogComponent implements OnInit {

  constructor(
    private _locale: LocalizationService,
    @Inject(MAT_DIALOG_DATA) private data: RequestApiResponseModel,
    private _reqServ: RequestsService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public printData(id: string): string {
    return String(this.data[id]);
  }

  public isDevMode(): boolean {
    return environment.devMode;
  }

  public showAsDateString(timestamp: string): string {
    return moment(Number(timestamp)).format();
  }

  public dev_recomputeQueryResult(): Promise<void> {
    this._reqServ.__dev_debugComputeAdhoc(this.data.query_id);
    this._toast.showToast('Please wait until this disappears, then go to DASHBOARD and then back here', null, {duration: 15000})
    return Promise.resolve();
  }
}
