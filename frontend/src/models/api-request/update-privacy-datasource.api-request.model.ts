export interface UpdatePrivacyDatasourceApiRequestModel {
  privacy_settings: {
    attribute: string;
    level: number;
  }[];
}
