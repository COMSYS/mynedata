import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css']
})
export class ScoreComponent implements OnInit, OnDestroy {

  constructor(
    private _crumbs: BreadcrumbsService,
    private _locale: LocalizationService
  ) {
    _crumbs.moveDown({
      link: 'score',
      path: _locale.get('score-link-text-sidenav')
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._crumbs.moveUp();
  }


}
