import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {

  constructor(
    private _breadcrumbs: BreadcrumbsService,
    public locale: LocalizationService
  ) {
    this._breadcrumbs.moveDown({
      path: this.locale.get('charts-link-text-sidenav'),
      link: 'charts'
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._breadcrumbs.moveUp();
  }

}
