import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {LocalizationService} from '../../core/services/localization.service';
import {ScoreService} from '../services/score.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-little-score-display',
  templateUrl: './little-score-display.component.html',
  styleUrls: ['./little-score-display.component.css']
})
export class LittleScoreDisplayComponent implements AfterViewInit, AfterViewChecked {
  private _lastUpdateDate: Date;
  private _lastUpdateString: string;
  private _currentScore: number;

  constructor(
    public locale: LocalizationService,
    private _scoreService: ScoreService,
    private cdRef: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {
    this._getScore();
  }

  ngAfterViewChecked(): void {
    /*
      this helps to prevent the ugly "value changed after expression checked" error/warning. Since it does only occur because a second
      detect cycle is started (after the first one ended) when in dev mode, this function shall only be called when in dev mode (to
      go easy on resources
      inspired by https://stackoverflow.com/a/43513959/7618184
    */
    if (!environment.production) {
      this.cdRef.detectChanges();
    }
  }

  public showScoreText(): string {
    const _score = this._getScore();
    const _placeholder = this.locale.get('score-display-placeholder');
    if (_score === 1) {
      return this.locale.get('score-display-text-singular').replace(_placeholder, String(_score));
    } else {
      return this.locale.get('score-display-text-plural').replace(_placeholder, String(_score));
    }
  }

  public showLastUpdated(): string {
    // do it this way to ensure that _lastUpdateString is not undefined when this function is called
    if (this._lastUpdateString) {
      return this._lastUpdateString;
    } else {
      return '';
    }
  }

  private _getScore(): number {
    this._lastUpdateDate = new Date();
    this._buildLastUpdateString();
    return this._scoreService.getCurrentScore();
  }

  private _buildLastUpdateString(): void {
    this._lastUpdateString = this._lastUpdateDate.toLocaleTimeString('de-DE', {
      timeZone: 'Europe/Berlin',
    });
  }

  public fetchScore(): void {
    this._currentScore = this._getScore();
  }

  public printScore(): string {
    return `${this._scoreService.getCurrentScore()}`;
  }

  public printScoreName(): string {
    return `${this._scoreService.getScoreName()}`;
  }

}
