import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {ScoreService} from '../../services/score.service';
import {SalesService} from '../../services/sales.service';

@Component({
  selector: 'app-dashboard-widget-my-sales',
  templateUrl: './dashboard-widget-my-sales.component.html',
  styleUrls: [
    './dashboard-widget-my-sales.component.css',
    '../dashboard-widgets.css'
  ]
})
export class DashboardWidgetMySalesComponent implements OnInit {

  constructor(
      public locale: LocalizationService,
      private _scoreService: ScoreService,
      private _salesService: SalesService
  ) { }

  ngOnInit() {
  }

  private _getSalesThisWeek(): number {
    return this._salesService.getQuantityOfSales();
  }
  public getScoreThisWeekText(): string {
    const _placeholderScore = this.locale.get('dashboard-widget-my-sales-score-this-week-placeholder');
    const _score = this._scoreService.getScoreFromThisWeek();
    if (_score === 1) {
      return this.locale.get('dashboard-widget-my-sales-score-this-week-text-singular').replace(_placeholderScore, String(_score));
    } else {
      return this.locale.get('dashboard-widget-my-sales-score-this-week-text-plural').replace(_placeholderScore, String(_score));
    }
  }

  public getSalesThisWeekText(): string {
    const _placeholderSales = this.locale.get('dashboard-widget-my-sales-sales-this-week-placeholder');
    const _sales = this._getSalesThisWeek();
    if (_sales === 1) {
      return this.locale.get('dashboard-widget-my-sales-sales-this-week-text-singular').replace(_placeholderSales, String(_sales));
    } else {
      return this.locale.get('dashboard-widget-my-sales-sales-this-week-text-plural').replace(_placeholderSales, String(_sales));
    }
  }

}
