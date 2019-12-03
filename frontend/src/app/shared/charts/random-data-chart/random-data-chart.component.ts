import {Component, Input, OnInit} from '@angular/core';
import {DatasourceWrapper} from '../../../user-zone/services/datasource.service';
import {Observable, Subscription} from 'rxjs';
import {DataFromDatasourceApiResponseModel} from '../../../../models/api-response/data-from-datasource.api-response.model';
import {Color, Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions, ChartPoint} from 'chart.js';
import {LocalizationService} from '../../../core/services/localization.service';

@Component({
  selector: 'app-random-data-chart',
  templateUrl: './random-data-chart.component.html',
  styleUrls: ['./random-data-chart.component.css']
})
export class RandomDataChartComponent implements OnInit {
  @Input() datasource: DatasourceWrapper;
  @Input() data$: Observable<DataFromDatasourceApiResponseModel[]>;

  public chartLabels: Label[] = [];
  public chartData: ChartDataSets[] = [];
  public chartOptions: (ChartOptions & { annotation: any }) = { annotation: '' };
  public chartColors: Color[] = [];
  public chartLegend = true;
  public chartType = 'line';
  public showCanvas: boolean = false;

  private _dataSubscription: Subscription;


  constructor(
    private _locale: LocalizationService
  ) { }

  async ngOnInit(): Promise<void> {
    this._dataSubscription = this.data$.subscribe(this._initChart.bind(this));
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  private _initChart(data: DataFromDatasourceApiResponseModel): void {
    const waitForAll = [
      this._setChartLabels(data),
      this._setChartData(data),
      this._setChartOptions(),
      this._setHasChartLegend(),
      this._setChartType()
    ];
    Promise.all(waitForAll).then(this._reloadCanvas.bind(this));
  }

  private async _setChartLabels(data): Promise<void> {
    const _labels: Label[] = [];
    for (const singleData of data) {
      _labels.push(new Date(Number(singleData.timestamp)).toLocaleString('de-DE'));
    }
    this.chartLabels = _labels;
  }

  private async _setChartData(data): Promise<void> {
    // holds the names of the attributes
    const _datasourceAttributes: string[] = [];
    // holds an object which keys are the attributes and the values point to corresponding `data: number[]` entry within the to-be-generated datasets
    const _helperPointerDictionary: {[key: string]: number[] | ChartPoint[]} = {};
    // holds the future datasets
    const _dataSets: ChartDataSets[] = [];
    for (const priv of this.datasource.privacy) {
      // pushed the attribute's name as string to array
      _datasourceAttributes.push(priv.attribute);
      // create an empty dataset for each attribute
      const tmpRawDataset: ChartDataSets = {data: [], label: priv.attribute};
      _dataSets.push(tmpRawDataset);
      // add a helping pointer to the array that will contain the displayed data within the dataset
      _helperPointerDictionary[priv.attribute] = tmpRawDataset.data;
    }
    for (const singleData of data) {
      for (const attribute of _datasourceAttributes) {
        // this is marked as an error in my IDE, but it works just as intended, as far as I can tell.
        // @ts-ignore
        (_helperPointerDictionary[attribute] as (number[] | ChartPoint[])).push(singleData[attribute]);
      }
    }
    this.chartData = _dataSets;
  }

  private _setChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      annotation: ''
    };
  }

  private _setChartColor(): void {
    this.chartColors = [
      {
        borderColor: 'black',
        backgroundColor: 'rgba(255,0,0,0.3)',
      },
    ];
  }

  private _setHasChartLegend(): void {
    this.chartLegend = true;
  }

  private _setChartType(): void {
    this.chartType = 'line';
  }

  private _reloadCanvas(): void {
    this.showCanvas = false;
    setTimeout(this.showCanvas = true, 1);
  }
}
