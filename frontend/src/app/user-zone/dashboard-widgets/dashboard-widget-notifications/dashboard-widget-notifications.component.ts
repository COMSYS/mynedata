import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {MatDialog} from '@angular/material';
import {EnrichedRequestModel} from '../../requests/requests.component';
import {RequestsService} from '../../../core/services/requests.service';
import {RequestIssuerService} from '../../../core/services/request-issuer.service';
import {ScoreService} from '../../services/score.service';

@Component({
  selector: 'app-dashboard-widget-notifications',
  templateUrl: './dashboard-widget-notifications.component.html',
  styleUrls: [
    './dashboard-widget-notifications.component.css',
    '../dashboard-widgets.css'
  ]
})
export class DashboardWidgetNotificationsComponent implements OnInit {

  public requests: Promise<EnrichedRequestModel[]>;

  constructor(
      public locale: LocalizationService,
      private _requestsDetailsAndActionsDialog: MatDialog,
      private _reqServ: RequestsService,
      private _reqIssServ: RequestIssuerService,
      private _scoreService: ScoreService
  ) {
    this.requests = this.getRequests();
  }

  ngOnInit() {
  }

  public getCorrectConjugationOfTheWordPoints(_points: number) {
    if (_points === 1) {
      return this.locale.get('score-name-singular');
    } else {
      return this.locale.get('score-name-plural');
    }
  }

  public async getRequests(): Promise<EnrichedRequestModel[]> {
    const _pendingReqs = await this._reqServ.getAvailableRequests() as EnrichedRequestModel[];
    for (const req of _pendingReqs) {
      req.processorObject = await this._reqIssServ.getIssuerById(req.processorId);
    }
    return _pendingReqs.filter((item, index) => index < 3);
  }

  public printReward(reward: number | string): string {
    if (isNaN(Number(reward)) && typeof reward === 'string') {
      return this.locale.get('dashboard-widget-requests-reward-not-a-number-text');
    } else {
      return this._scoreService.getScoreWithName(reward as number);
    }
  }
}
