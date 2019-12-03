import {Injectable, OnDestroy} from '@angular/core';
import {LocalizationService} from '../../core/services/localization.service';
import {isNull} from 'util';

@Injectable({
  providedIn: 'root'
})
export class ScoreService implements OnDestroy {

  private _currentScore: number;
  private _scoreThisWeek: number;

  constructor(
    private _locale: LocalizationService
  ) {
    this._currentScore = 550;
    this._scoreThisWeek = 300;
  }

  ngOnDestroy(): void {
    this._currentScore = undefined;
    this._scoreThisWeek = undefined;
    this._locale = undefined;
  }

  public getCurrentScore(): number {
    return this._currentScore;
  }

  public getScoreFromThisWeek(): number {
    return this._scoreThisWeek;
  }

  public add(addendum: number): void {
    this._currentScore += addendum;
    this._scoreThisWeek += addendum;
  }

  public getScoreWithName(points: number = this.getCurrentScore()): string {
    return `${points} ${this.getScoreName(points)}`;
  }

  public getScoreName(points: number = this.getCurrentScore()) {
    const grammNumber: string = (points === 1) ? 'singular' : 'plural';
    return `${this._locale.get(`score-name-${grammNumber}`)}`;
  }

  public getWorthOfPoints(points: number = this.getCurrentScore()): number {
    return points / 100;
  }

  public getWorthOfPointsWithCurrencySymbol(points: number = this.getCurrentScore()): string {
    return `${(points / 100).toFixed(2)}${this._locale.get('main-currency-symbol')}`;
  }
}
