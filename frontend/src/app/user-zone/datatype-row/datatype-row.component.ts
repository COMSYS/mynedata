import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {LocalizationService} from '../../core/services/localization.service';
import {Options} from 'ng5-slider';
import {FormControl, FormGroup} from '@angular/forms';
import {isUndefined} from 'util';
import {DataType} from '../../../config/data-types.config';

@Component({
  selector: 'app-datatype-row',
  templateUrl: './datatype-row.component.html',
  styleUrls: ['./datatype-row.component.css']
})
export class DatatypeRowComponent implements OnInit, AfterViewInit {
  @Input('datatype') _passedDataTypeObject: DataType;

  /*
  inspired by https://medium.com/@joshblf/using-child-components-in-angular-forms-d44e60036664
   */
  @Input() parentFormGroup: FormGroup;
  @Input() childFormControlName: string;
  @Input() showLegends: boolean;

  @Output('changed') changeEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Input('refresh-slider') refreshSlider: EventEmitter<void>;

  @Input() useInEditDatasource: boolean;
  @Input() defaultPrivacy: number;

  public currentPrivacyValueOnSlider: number;


  private _ng5SliderBaseOptions: Options = {
    showTicks: true,
    showTicksValues: false,
    ticksTooltip: this.getTickTooltip.bind(this),
    floor: 0,
    ceil: 3,
  };
  private _ng5SliderStepsArray = [
    {value: 0, legend: this.getTickLegend(0)},
    {value: 1, legend: this.getTickLegend(1)},
    {value: 2, legend: this.getTickLegend(2)},
    {value: 3, legend: this.getTickLegend(3)}
  ];

  constructor(
    private _locale: LocalizationService
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }

  public print(identifier: string): string {
    return this._locale.get(identifier);
  }

  public getNg5SliderOptions(): Options {
    if (this.showLegends) {
      const tmpOptions = Object.assign({}, this._ng5SliderBaseOptions);
      return Object.assign(tmpOptions, <Options>{stepsArray: this._ng5SliderStepsArray});
    }
    return this._ng5SliderBaseOptions;
  }

  public getTickLegend(tickNumber: number): string {
    return this.print(`datatype-privacy-slider-${tickNumber}-tick-legend`);
  }

  public getTickTooltip(tickNumber: number): string {
    return this.print(`datatype-privacy-slider-${tickNumber}-tick-tooltip`);
  }

  public hasDefaultPrivacy(): boolean {
    if (this.useInEditDatasource && !isUndefined(this.defaultPrivacy)) {
      if (this.parentFormGroup.controls['dt_' + this._passedDataTypeObject.id].value === this.defaultPrivacy) {
        return true;
      }
    }
    return false;
  }
}
