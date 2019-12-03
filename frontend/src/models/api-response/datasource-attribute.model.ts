import {DataTypes} from '../../config/data-types.config';

export interface DatasourceAttributeModel {
  name: string;
  primitiveType: 'text' | 'number' | 'else';
  datatype: DataTypes;
}
