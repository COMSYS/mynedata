import {DATASOURCE_TIME_UNIT} from '../app/core/services/upload-granularity.service';
import {DatasourceWrapper} from '../app/user-zone/services/datasource.service';

export const AdditionalDatasourcesMock: DatasourceWrapper[] = [
  {
    datatypes: [1, 3, 4],
    frequency: 3,
    id: 9999999,
    name: 'test_1',
    mock: true,
    displayedName: 'Gesichtsbuch',
    privacy: [
      {
        attribute: 'arbit1_one',
        dataTypeId: 1,
        label: 'unknown',
        level: 0
      },
      {
        attribute: 'arbit1_two',
        dataTypeId: 3,
        label: 'unknown',
        level: 2
      },
      {
        attribute: 'arbit1_three',
        dataTypeId: 4,
        label: 'unknown',
        level: 3
      }
    ],
    timestamp: 0,
    unitOfTime: DATASOURCE_TIME_UNIT.days,
  },
  {
    datatypes: [1, 2, 5],
    frequency: 3,
    id: 9999998,
    name: 'test_2',
    mock: true,
    displayedName: 'Bluecat Bus Tours',
    privacy: [
      {
        attribute: 'arbit2_one',
        dataTypeId: 1,
        label: 'unknown',
        level: 1
      },
      {
        attribute: 'arbit2_two',
        dataTypeId: 2,
        label: 'unknown',
        level: 1
      },
      {
        attribute: 'arbit2_three',
        dataTypeId: 5,
        label: 'unknown',
        level: 2
      }
    ],
    timestamp: 0,
    unitOfTime: DATASOURCE_TIME_UNIT.days,
  }
];
