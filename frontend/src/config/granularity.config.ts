import {DATASOURCE_TIME_UNIT} from '../app/core/services/upload-granularity.service';

export interface GranularityConfigModel {
  availableScales: {
    localeRef: string;
    meaning: DATASOURCE_TIME_UNIT
  }[];
}

export const GranularityConfig: GranularityConfigModel = {
  availableScales: [
    {
      localeRef: 'add-datasource-granularity-time-scales-seconds',
      meaning: DATASOURCE_TIME_UNIT.seconds
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-minutes',
      meaning: DATASOURCE_TIME_UNIT.minutes
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-hours',
      meaning: DATASOURCE_TIME_UNIT.hours
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-days',
      meaning: DATASOURCE_TIME_UNIT.days
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-weeks',
      meaning: DATASOURCE_TIME_UNIT.weeks
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-months',
      meaning: DATASOURCE_TIME_UNIT.months
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-years',
      meaning: DATASOURCE_TIME_UNIT.years
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-decades',
      meaning: DATASOURCE_TIME_UNIT.decades
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-centuries',
      meaning: DATASOURCE_TIME_UNIT.centuries
    },
    {
      localeRef: 'add-datasource-granularity-time-scales-millenia',
      meaning: DATASOURCE_TIME_UNIT.millenia
    }
  ]
};
