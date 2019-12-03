import {Component, OnInit} from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {DatasourceService, DatasourceWrapper} from '../../services/datasource.service';
import {PrivacyService} from '../../services/privacy.service';
import {DATASOURCE_TIME_UNIT} from '../../../core/services/upload-granularity.service';
import {ActivatedRoute} from '@angular/router';
import {isNull, isNumber, isUndefined} from 'util';

@Component({
  selector: 'app-dashboard-widget-data-sources',
  templateUrl: './dashboard-widget-data-sources.component.html',
  styleUrls: [
    './dashboard-widget-data-sources.component.css',
    '../dashboard-widgets.css',
    '../../user-zone.component.css'
  ]
})
export class DashboardWidgetDataSourcesComponent implements OnInit {

  displayedColumns: string[] = ['name', 'privacy'];

  constructor(
    public locale: LocalizationService,
    private _datasourceService: DatasourceService,
    private _privacyService: PrivacyService
  ) {
  }

  ngOnInit() {
    this._datasourceService.getRegisteredDatasources(true);
  }

  public getPrivacySettingAsColor(privacy: number): Object {
    return this._privacyService.getPrivacySettingAsCssClass(privacy);
  }

  public getPrivacyAsColorTooltip(privacy: number): string {
    return this._privacyService.getPrivacyAsColorTooltip(privacy);
  }

  public getRegisteredDatasources(): Promise<DatasourceWrapper[]> {
    return this._datasourceService.getRegisteredDatasources();
  }

  public editDatasource(ds: DatasourceWrapper): void {
  }

  public showDataOfDatasource(ds: DatasourceWrapper): void {
    if (!ds.mock) {
    }
  }

  public async removeDatasource(ds: DatasourceWrapper): Promise<void> {
    if (!ds.mock) {
      await this._datasourceService.deregisterDatasource(ds.id);
    }
  }

}
