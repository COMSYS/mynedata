import {RequestIssuerTypes} from '../config/requests-issuer-types.config';

export const RequestIssuerPermissionsMock = {
  [RequestIssuerTypes.SCIENCE]: false,
  [RequestIssuerTypes.GOVERNMENT]: false,
  [RequestIssuerTypes.GERMAN_EU_COMPANY]: false,
  [RequestIssuerTypes.INTERNATIONAL_COMPANY]: false,
  [RequestIssuerTypes.BANK_OR_INSURANCE]: false,
  [RequestIssuerTypes.UNION_OR_NGO]: false,
  [RequestIssuerTypes.PRIVATE]: false,
};
