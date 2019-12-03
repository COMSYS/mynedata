
import {DatasourceAttributeModel} from './datasource-attribute.model';

export interface AvailableDatasourceApiResponseModel {
  data_source_id: number;
  data_source_name: string;
  data_source_attributes?: DatasourceAttributeModel[];
  displayed_name?: string;
}
