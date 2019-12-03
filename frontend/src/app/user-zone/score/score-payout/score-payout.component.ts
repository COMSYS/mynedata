import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbsService} from '../../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../../core/services/localization.service';
import {ScoreService} from '../../services/score.service';

enum PAYOUT_PAGE_STATES {
  OVERVIEW,
  GET_MONEY,
  GET_VOUCHER,
  DO_DONATE
}

@Component({
  selector: 'app-score-payout',
  templateUrl: './score-payout.component.html',
  styleUrls: ['./score-payout.component.css', '../score.component.css']
})
export class ScorePayoutComponent implements OnInit {

  private _state: PAYOUT_PAGE_STATES = PAYOUT_PAGE_STATES.OVERVIEW;

  constructor(
    private _locale: LocalizationService,
    private _scoreService: ScoreService
  ) {

  }

  ngOnInit() {
  }

  isOverviewState(): boolean {
    return this._state === PAYOUT_PAGE_STATES.OVERVIEW;
  }

  isGetMoneyState(): boolean {
    return this._state === PAYOUT_PAGE_STATES.GET_MONEY;
  }

  isGetVoucherState(): boolean {
    return this._state === PAYOUT_PAGE_STATES.GET_VOUCHER;
  }

  isDoDonateState(): boolean {
    return this._state === PAYOUT_PAGE_STATES.DO_DONATE;
  }

  public setState(state: PAYOUT_PAGE_STATES): void {
    this._state = state;
  }

  public setGetMoneyState(): void {
    this.setState(PAYOUT_PAGE_STATES.GET_MONEY);
  }

  public setGetVoucherState(): void {
    this.setState(PAYOUT_PAGE_STATES.GET_VOUCHER);
  }

  public setDoDonateState(): void {
    this.setState(PAYOUT_PAGE_STATES.DO_DONATE);
  }

  public setOverviewState(): void {
    this.setState(PAYOUT_PAGE_STATES.OVERVIEW);
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public getPoints(): string {
    return this._scoreService.getScoreWithName();
  }

  public getWorthOfPoints(): string {
    return this._scoreService.getWorthOfPointsWithCurrencySymbol();
  }

}
