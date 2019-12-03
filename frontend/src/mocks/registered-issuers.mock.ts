import {RegisteredIssuerApiResponseModel} from '../models/api-response/registered-issuer.api-response.model';
import {RequestIssuerTypes} from '../config/requests-issuer-types.config';

export const RegisteredIssuersMock: RegisteredIssuerApiResponseModel[] = [
  {
    id: 0,
    name: 'Your Home',
    logoUrl: 'your-home.logo.mock.png',
    industryBranch: RequestIssuerTypes.GERMAN_EU_COMPANY,
    websiteUrl: undefined,
    locatedIn: {
      cityName: 'Erkelenz',
      address: undefined
    }
  },
  {
    id: 1,
    name: 'Lehrstuhl CommScience',
    logoUrl: 'lehrstuhl-commscience.logo.mock.png',
    industryBranch: RequestIssuerTypes.SCIENCE,
    websiteUrl: 'http://www.comm.rwth-aachen.de/',
    locatedIn: {
      cityName: 'Aachen',
      address: undefined
    }
  },
  {
    id: 2,
    name: 'Dialego',
    logoUrl: 'dialego.logo.mock.png',
    industryBranch: RequestIssuerTypes.GERMAN_EU_COMPANY,
    websiteUrl: undefined,
    locatedIn: {
      cityName: 'Aachen',
      address: undefined
    }
  },
  {
    id: 3,
    name: 'Uniklinik Musterhausen',
    logoUrl: 'uniklinik-musterhausen.logo.mock.png',
    industryBranch: RequestIssuerTypes.SCIENCE,
    websiteUrl: undefined,
    locatedIn: {
      cityName: 'Musterhausen',
      address: undefined
    }
  }
];
