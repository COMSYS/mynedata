export interface DatasourcePrivacyApiResponseModel {
  attribute: string;
  label: string;
  level: number;
  // this is not contained by the API's response but will be added later to make wokring with these objects easier
  dataTypeId?: number;
}
