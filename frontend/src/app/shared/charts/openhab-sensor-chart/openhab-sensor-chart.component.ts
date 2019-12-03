import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import {DatasourceWrapper} from '../../../user-zone/services/datasource.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {DataFromDatasourceApiResponseModel} from '../../../../models/api-response/data-from-datasource.api-response.model';
import {Color, Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions, ChartPoint} from 'chart.js';
import {LocalizationService} from '../../../core/services/localization.service';
import {forEach} from '@angular/router/src/utils/collection';
import {hasOwnProperty} from 'tslint/lib/utils';
import * as Moment from 'moment';
import {extendMoment} from 'moment-range';

const moment = extendMoment(Moment);

type OpenhabSensorDataModel = DataFromDatasourceApiResponseModel & {
  sensor_name: string;
  data_type: string;
  value: number | string;
};

interface OpenhabSensorSubDataStructure<T> {
  timestamp: number;
  value: T;
}

interface ConvertedOpenhabSensorDataModel {
  [key: string]: ConvertedOpenhabSensorDataSubStructureModel;
}

interface ConvertedOpenhabSensorDataSubStructureModel {
  data_type: string;
  values: OpenhabSensorSubDataStructure<string | number>[];
}

interface AvailableSourceModel {
  id: string;
  readable: string;
}

const MapSensorDatatypeToInternalType = {
  battery: 'number',
  temperature: 'number',
  light: 'number',
  unknown: 'number',
  humidity: 'number',
  sunrise: 'string'
};

@Component({
  selector: 'app-openhab-sensor-chart',
  templateUrl: './openhab-sensor-chart.component.html',
  styleUrls: ['./openhab-sensor-chart.component.css']
})
export class OpenhabSensorChartComponent implements OnInit {
  @Input() datasource: DatasourceWrapper;
  @Input() data$: Observable<DataFromDatasourceApiResponseModel[]>;

  // options for the chart
  public yAxisLabel = '';
  public chartLabels: Label[] = [];
  public chartData;
  public chartOptions: (ChartOptions & { annotation: any }) = { annotation: '' };
  public chartColors: Color[] = [];
  public chartLegend = true;
  public chartType = 'line';
  public yAxisFormatter: (number) => string = this._defaultFormat.bind(this);
  public availableSources: AvailableSourceModel[] = [];
  public colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };

  public showCanvas: boolean = false;
  public showSources: boolean = false;

  private _dataSubscription: Subscription;
  private _convertedData: ConvertedOpenhabSensorDataModel;
  private _selectedSource = '';
  private _currentData: ConvertedOpenhabSensorDataSubStructureModel;

  constructor(
    private _locale: LocalizationService
  ) { }

  async ngOnInit(): Promise<void> {
    this._dataSubscription = this.data$.subscribe((data: OpenhabSensorDataModel[]) => {
      this._convertedData = this._convertData(data);
      this._setAvailableSources(this._convertedData);
      // if the currentData is not undefined or null, then the chart has already been rendered and needs t be rendered anew
      if (this._currentData !== undefined && this._currentData != null) {
        this._currentData = this._convertedData[this._selectedSource];
        this._initChart(this._currentData);
      }
    });
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  private _initChart(data: ConvertedOpenhabSensorDataSubStructureModel): void {
    const waitForAll = [
      this._setYAxisFormatter(data),
      this._setChartLabels(data),
      this._setChartData(data),
      this._setChartOptions(),
      this._setHasChartLegend(),
      this._setChartType()
    ];
    Promise.all(waitForAll).then(this._reloadCanvas.bind(this));
  }

  private _setYAxisFormatter(data: ConvertedOpenhabSensorDataSubStructureModel): Promise<void> {
    switch (data.data_type) {
      case 'temperature':
        this.yAxisFormatter = this._formatAsTemperature;
        break;
      case 'humidity':
      case 'battery':
        this.yAxisFormatter = this._formatAsPercentage;
        break;
      case 'sunrise':
      case 'sunset':
        this.yAxisFormatter = this._formatAsTimeOfDay;
        break;
      case 'light':
        this.yAxisFormatter = this._formatAsLuminance;
        break;
      default:
        this.yAxisFormatter = this._defaultFormat;
        break;
    }
    return Promise.resolve();
  }

  private async _setChartLabels(data: ConvertedOpenhabSensorDataSubStructureModel): Promise<void> {
    // the labels are no longer used but I won't delete this code yet
    switch (data.data_type) {
      case 'temperature':
        this.yAxisLabel = 'TEMPERATURE IN °C';
        break;
      case 'humidity':
        this.yAxisLabel = 'HUMIDITY IN %';
        break;
      case 'sunrise':
        this.yAxisLabel = 'SUNRISE AT';
        break;
      default:
        break;
    }
  }

  private async _setChartData(data: ConvertedOpenhabSensorDataSubStructureModel): Promise<void> {
    // holds the names of the attributes
    const ret = {
      // to only display the type of the data (not the sensor's name) while hovering the chart
      name: (this._selectedSource.split('_'))[1],
      series: []
    };
    switch (data.data_type) {
      case 'sunrise':
      case 'sunset':
        for (const val of data.values) {
          (ret.series as Array<any>).push({value: this._normalizeTimeOfDay(moment(val.value)), name: Number(val.timestamp)});
          val['name'] = moment(Number(val.timestamp)).format('lll');
        }
        break;
      default:
        for (const val of data.values) {
          (ret.series as Array<any>).push({value: val.value, name: Number(val.timestamp)}); // name: moment(Number(val.timestamp)).format('MMM D, HH:MM')});
          val['name'] = moment(Number(val.timestamp)).format('lll');
        }
        break;
    }

    // next line is necessary because the chart component expects an array
    this.chartData = [ret];

    switch (MapSensorDatatypeToInternalType[data.data_type]) {
      case 'number':
        break;
      case 'string':
        break;
      default:
        break;
    }

    return Promise.resolve();
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

  private _normalizeTimeOfDay(date: Moment.Moment): number {
    const hoursInMilliseconds: number = date.hours() * 60 * 60 * 1000;
    const minutesInMilliseconds: number = date.minutes() * 60 * 1000;
    const secondsInMilliseconds: number = date.seconds() * 1000;
    const milliseconds: number = date.milliseconds();

    return hoursInMilliseconds + minutesInMilliseconds  + secondsInMilliseconds + milliseconds;
  }

  private _convertData(data: OpenhabSensorDataModel[]): ConvertedOpenhabSensorDataModel {
    const _convertedData: ConvertedOpenhabSensorDataModel = {};
    let restOfData = data;
    for (; restOfData.length > 0;) {
      const _sensorName = restOfData[0].sensor_name;
      const _hardCopy = JSON.parse(JSON.stringify(restOfData.filter(entry => entry.sensor_name === _sensorName)));
      const _dataType = restOfData[0].data_type;
      const _needToConvertToNumber = this._isThisDataTypeNumber(_dataType);
      for (const copy of _hardCopy) {
        delete copy.user_id;
        delete copy.data_type;
        delete copy.sensor_name;
        if (_needToConvertToNumber) {
          try {
            copy['value'] = Number(copy['value']);
          } catch (e) {
            throw e;
          }
        }
      }
      _convertedData[_sensorName] = {
        values: _hardCopy,
        data_type: _dataType
      };
      restOfData = restOfData.filter(entry => entry.sensor_name !== _sensorName);
    }
    return _convertedData;
  }

  private _isThisDataTypeNumber(type: string): boolean {
    return MapSensorDatatypeToInternalType[type.toLowerCase()] === 'number';
  }

  private _setAvailableSources(data: ConvertedOpenhabSensorDataModel): void {
    this.showSources = false;
    this.availableSources = [];
    for (const key in data) {
      if (key.toLowerCase() !== 'today' && key.toLowerCase() !== 'day_phase' && key.toLowerCase() !== 'moon_next_new' && key.toLowerCase() !== 'moon_next_full') {
        const _partsOfKey = key.split('_');
        this.availableSources.push({
          id: key,
          readable: _partsOfKey[0] + ' (' + _partsOfKey[1] + ')'
        });
      }
    }
    this.showSources = true;
  }

  public onSourceSelectionChange(selectedSource: string): void {
    if (selectedSource && hasOwnProperty(this._convertedData, selectedSource)) {
      this._selectedSource = selectedSource;
      this._currentData = this._convertedData[selectedSource];
      this._initChart(this._currentData);
    }
  }

  public formatXAxisTicks(valueX: number): string {
    return moment(Number(valueX)).format('MMM D, HH:MM');
  }

  private _formatAsTemperature(value: number): string {
    return value.toString() + ' °C';
  }

  private _formatAsPercentage(value: number): string {
    return value.toString() + ' %';
  }

  private _formatAsTimeOfDay(value: number): string {
    const milliseconds: number = (value % 1000);
    const secondsInMs: number = (value - milliseconds) % (1000 * 60);
    const minutesInMs: number = (value - milliseconds - secondsInMs) % (1000 * 60 * 60);
    const hoursInMs: number = (value - milliseconds - secondsInMs - minutesInMs);

    const seconds = secondsInMs / 1000;
    const minutes = minutesInMs / (1000 * 60);
    const hours = hoursInMs / (1000 * 60 * 60);

    const _date = moment().startOf('day').utc();
    const _currentUtcOffset = _date.utcOffset();
    // set utc offset to 0, so that it can be converted back to current utc offset, since the provided hours, minutes, seconds and milliseconds come from an ISO string
    _date.utcOffset(0);
    _date.hours(hours).minutes(minutes).seconds(seconds).milliseconds(milliseconds);
    _date.utcOffset(_currentUtcOffset);
    return _date.format('HH:mm:ss:SSS');
  }

  private _formatAsLuminance(value: number): string {
    return value.toString() + ' cd/m²';
  }

  private _defaultFormat(value: number): string {
    return value.toString();
  }

  public onSelect(e) {
    console.log(e);
  }

  public printNoDataAvailable(): string {
    return this._locale.get('data-view-component-placeholder-no-sensor-available');
  }

  public printLabelOfSensorDropdownList(): string {
    return this._locale.get('data-view-component-label-sensor-dropdown');
  }
}
