import {DataFromDatasourceApiResponseModel} from './api-response/data-from-datasource.api-response.model';

export interface MatColumnDefModel {
  name: string;
  header: string;
  cell: (dataRow: DataFromDatasourceApiResponseModel) => string | number;
  sortable?: boolean;
}
