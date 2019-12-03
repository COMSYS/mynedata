import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PrivacyService} from '../../services/privacy.service';
import {LocalizationService} from '../../../core/services/localization.service';
import {Options} from 'ng5-slider';
import {predefinedPrivacyLevelsConfig} from '../../../../config/predefined-privacy-levels.config';
import {Subscription} from 'rxjs';
import {ToolsService} from '../../../core/services/tools.service';

@Component({
  selector: 'app-global-privacy',
  templateUrl: './global-privacy.component.html',
  styleUrls: ['./global-privacy.component.css', './../privacy-settings.component.css']
})
export class GlobalPrivacyComponent implements OnInit, OnDestroy {
  @Input('refresh-slider') refreshSlider: EventEmitter<void>;
  @Input() recheckTickPosition: EventEmitter<void>;
  private _recheckTickPositionSubscription: Subscription;

  @Input('parent-form') parentForm: FormGroup;
  @Input('form-group-name-datatypes-privacies') formGroupNameDatatypesPrivacies: string;

  @Output('onChange') onChangedSliderValue = new EventEmitter<void>();

  @Input() dataTypesPrivaciesReady: EventEmitter<void>;
  private _dataTypesPrivaciesReadySubscription: Subscription;

  public formGroup: FormGroup;
  public readyToDisplay: boolean = false;

  private _positionOfCustomTick: number = 5;
  public ng5SliderBaseOptions: Options = {
    showTicks: true,
    showTicksValues: false,
    ticksTooltip: this.getTickTooltip.bind(this),
    floor: 0,
    ceil: 3,
    stepsArray: [
      // already tried to make the 'custom' tick appear only when appropriate, but the slider does not (yet?) support adding ticks later on, refreshing the slider yields no effect on displaying added ticks
      {value: 0, legend: this.getTickLegend(0)},
      {value: 1, legend: this.getTickLegend(1)},
      {value: 2, legend: this.getTickLegend(2)},
      {value: 3, legend: this.getTickLegend(3)},
      {value: 4, legend: this.getTickLegend(4)},
      {value: this._positionOfCustomTick, legend: this.getTickLegend(this._positionOfCustomTick)}
    ]
  };


  constructor(
      private _privacy: PrivacyService,
      private _locale: LocalizationService
  ) {}

  ngOnInit() {
    this._recheckTickPositionSubscription = this.recheckTickPosition.subscribe(this._recheckTickPosition.bind(this));
    this._dataTypesPrivaciesReadySubscription = this.dataTypesPrivaciesReady.subscribe(this._dataTypePrivaciesReady.bind(this));
  }

  ngOnDestroy(): void {
    this._recheckTickPositionSubscription.unsubscribe();
    this._dataTypesPrivaciesReadySubscription.unsubscribe();
  }

  public getMaxPrivacy(): number {
    return this._privacy.getMaxPrivacy();
  }

  public getMinPrivacy(): number {
    return this._privacy.getMinPrivacy();
  }

  public print(identifier: string): string {
    return this._locale.get(identifier);
  }

  public getTickLegend(tickNumber: number): string {
    return this.print(`predefined-privacy-slider-${tickNumber}-tick-legend`);
  }

  public getTickTooltip(tickNumber: number): string {
    return this.print(`predefined-privacy-slider-${tickNumber}-tick-tooltip`);
  }

  public setDatatypesPrivaciesToPredefinedState(state: number): void {
    if (state !== this._positionOfCustomTick) {
      this.parentForm.get(this.formGroupNameDatatypesPrivacies).patchValue(predefinedPrivacyLevelsConfig[state].datatypesPrivacies);
    } else { // then the 'custom' tick is selected
      // so far, nothing needs to be done when a user moves the slider to this position
    }
  }

  private _recheckTickPosition(): void {
    this.formGroup.controls['predefinedPrivaciesSlider'].patchValue(this._calculateTickPosition());
  }

  private _dataTypePrivaciesReady(): void {
    // find initial slider position
    this.formGroup = new FormGroup({
      predefinedPrivaciesSlider: new FormControl(this._calculateTickPosition())
    });
    this.readyToDisplay = true;
  }

  private _calculateTickPosition(): number {
    const datatypePrivacies = this.parentForm.controls['datatypesPrivacies'].value;
    // positionOfCustomTick - 1 because there is always one less predefined states, due to the custom tick being on the right-most position
    for (let i = 0; i < this._positionOfCustomTick - 1; i++) {
      const isEqual = ToolsService.primitiveStrictEqualityTestObjects(datatypePrivacies, predefinedPrivacyLevelsConfig[i].datatypesPrivacies);
      if (isEqual) {
        return i;
      }
    }
    return this._positionOfCustomTick;
  }
}
