import {Injectable} from '@angular/core';

export enum DATASOURCE_TIME_UNIT {
  seconds,
  minutes,
  hours,
  days,
  weeks,
  months,
  years,
  decades,
  centuries,
  millenia
}

@Injectable({
  providedIn: 'root'
})
export class UploadGranularityService {

  constructor() { }

  public static convertUploadIntervalToMilliseconds(_frequency: number, _unitOfTime: DATASOURCE_TIME_UNIT): number {
    // trusting that this function gets called when already checked that unitOfTime is plausible
    const timeInSeconds: Array<number> = [1, 60, 3600, 86400, 604800, 2629743, 31556926, 315569260, 3155692600, 31556926000];

    return _frequency * timeInSeconds[_unitOfTime] * 1000;
  }

  public static convertMillisecondsToFrequencyAndUnitOfTime(ms: number): {frequency: number; unitOfTime: DATASOURCE_TIME_UNIT} {
    const timeInSeconds: Array<number> = [1, 60, 3600, 86400, 604800, 2629743, 31556926, 315569260, 3155692600, 31556926000];
    if (ms < 1000) {
      return {frequency: 1, unitOfTime: DATASOURCE_TIME_UNIT.seconds};
    }
    const _s = Math.floor(ms / 1000);
    if (_s < timeInSeconds[1]) {
      return {frequency: _s, unitOfTime: DATASOURCE_TIME_UNIT.seconds};
    } else if (_s < timeInSeconds[2]) {
      return {frequency: Math.floor(_s / timeInSeconds[1]), unitOfTime: DATASOURCE_TIME_UNIT.minutes};
    } else if (_s < timeInSeconds[3]) {
      return {frequency: Math.floor(_s / timeInSeconds[2]), unitOfTime: DATASOURCE_TIME_UNIT.hours};
    } else if (_s < timeInSeconds[4]) {
      return {frequency: Math.floor(_s / timeInSeconds[3]), unitOfTime: DATASOURCE_TIME_UNIT.days};
    } else if (_s < timeInSeconds[5]) {
      return {frequency: Math.floor(_s / timeInSeconds[4]), unitOfTime: DATASOURCE_TIME_UNIT.weeks};
    } else if (_s < timeInSeconds[6]) {
      return {frequency: Math.floor(_s / timeInSeconds[5]), unitOfTime: DATASOURCE_TIME_UNIT.months};
    } else if (_s < timeInSeconds[7]) {
      return {frequency: Math.floor(_s / timeInSeconds[6]), unitOfTime: DATASOURCE_TIME_UNIT.years};
    } else if (_s < timeInSeconds[8]) {
      return {frequency: Math.floor(_s / timeInSeconds[7]), unitOfTime: DATASOURCE_TIME_UNIT.decades};
    } else if (_s < timeInSeconds[9]) {
      return {frequency: Math.floor(_s / timeInSeconds[8]), unitOfTime: DATASOURCE_TIME_UNIT.centuries};
    } else {
      return {frequency: Math.floor(_s / timeInSeconds[9]), unitOfTime: DATASOURCE_TIME_UNIT.millenia};
    }
  }
}
