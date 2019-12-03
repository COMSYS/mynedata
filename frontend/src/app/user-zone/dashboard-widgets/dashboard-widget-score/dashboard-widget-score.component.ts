import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {ScoreService} from '../../services/score.service';

@Component({
  selector: 'app-dashboard-widget-score',
  templateUrl: './dashboard-widget-score.component.html',
  styleUrls: ['./dashboard-widget-score.component.css', '../dashboard-widgets.css']
})
export class DashboardWidgetScoreComponent implements OnInit {

  constructor(
    public locale: LocalizationService,
    private _scoreService: ScoreService
  ) { }

  ngOnInit() {
  }

  public getPoints(): string {
    return this._scoreService.getScoreWithName();
  }

  public getWorthOfPoints(): string {
    return this._scoreService.getWorthOfPointsWithCurrencySymbol();
  }

}
