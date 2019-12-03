export interface RegisteredDatasourceApiResponseModel {
  access_token: string;
  data_source_id: number;
  data_source_name: string;
  privacy_level: {
    attribute: string;
    level: number;
  }[];
  timestamp: number;
  upload_interval: number;
}
