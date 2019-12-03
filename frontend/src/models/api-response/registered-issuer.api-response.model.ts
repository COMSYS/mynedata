import {RequestIssuerTypes} from '../../config/requests-issuer-types.config';

export interface RegisteredIssuerApiResponseModel {
  id: number;
  name: string;
  logoUrl?: string;
  industryBranch: RequestIssuerTypes;
  websiteUrl?: string;
  locatedIn: {
    cityName: string;
    // address aims to hold a string respresenting a valid address or just some coordinates
    address?: string;
  };
}
