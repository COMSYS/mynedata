import {Component, OnInit} from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {FormControl} from '@angular/forms';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {DataType} from '../../../../config/data-types.config';
import {DataTypesService} from '../../../core/services/data-types.service';
import {DatasourceService, DatasourceWrapper} from '../../services/datasource.service';
import {DATASOURCE_TIME_UNIT} from '../../../core/services/upload-granularity.service';

@Component({
  selector: 'app-dashboard-widget-chart',
  templateUrl: './dashboard-widget-chart.component.html',
  styleUrls: [
    './dashboard-widget-chart.component.css',
    '../dashboard-widgets.css'
  ]
})
export class DashboardWidgetChartComponent implements OnInit {
  public dataTypes: DataType[] = [];
  public datasources: Promise<DatasourceWrapper[]> = new Promise(resolve => {
    let x: DatasourceWrapper = {
      id: 900,
      name: 'test',
      frequency: 3,
      unitOfTime: DATASOURCE_TIME_UNIT.days
    }
    resolve([x]);
  });

  private _dateStart: Date;
  private _dateEnd: Date;

  public chosenDatatype;

  public formControlDateStart: FormControl;
  public formControlDateEnd: FormControl;

  constructor(
      public locale: LocalizationService,
      private adapter: DateAdapter<any>,
      private _datatypes: DataTypesService,
      private _datasourceService: DatasourceService
  ) {
      this._fetchRegisteredDatasources();
      this._dateStart = new Date();
      this._shiftBackStartTime(6);
      this.formControlDateStart = new FormControl(this._dateStart);
      this._dateEnd = new Date();
      this.formControlDateEnd = new FormControl(this._dateEnd);
  }

  private _shiftBackStartTime(months: number) {
      const _currentMonth = this._dateStart.getMonth();

      this._dateStart.setMonth((_currentMonth - months) % 12);

      if (months > _currentMonth) {
          this._dateStart.setFullYear(this._dateStart.getFullYear() - 1);
      }
  }

  ngOnInit() {
  }

  public openChart(form) {
      const _params = form.value;
      console.log(form);
  }

  private async _fetchRegisteredDatasources(): Promise<DatasourceWrapper[]> {
    this.datasources = this._datasourceService.getRegisteredDatasources();
    return this.datasources;
  }
}
