import {DataType, DataTypes} from './data-types.config';

export enum RequestIssuerTypes {
  SCIENCE,
  GOVERNMENT,
  GERMAN_EU_COMPANY,
  INTERNATIONAL_COMPANY,
  BANK_OR_INSURANCE,
  UNION_OR_NGO,
  PRIVATE
}

export interface RequestIssuerType {
  nameLocaleIdentifier: string;
  descriptionLocaleIdentifier?: string;
  id: RequestIssuerTypes;
  iconPath: string;
  privacy?: number;
  isEnabled: boolean;
}

const isEnabledByDefault = false;

export const requestIssuerTypesConfig: RequestIssuerType[] = [
  {
    nameLocaleIdentifier: 'science-request-issuer-type-name',
    descriptionLocaleIdentifier: 'science-request-issuer-type-description',
    id: RequestIssuerTypes.SCIENCE,
    iconPath: '/science-request-issuer-icon.png',
    isEnabled: isEnabledByDefault
  },
  {
    nameLocaleIdentifier: 'government-request-issuer-type-name',
    descriptionLocaleIdentifier: 'government-request-issuer-type-description',
    id: RequestIssuerTypes.GOVERNMENT,
    iconPath: '/government-request-issuer-icon.png',
    isEnabled: isEnabledByDefault
  },
  {
    nameLocaleIdentifier: 'german-eu-company-request-issuer-type-name',
    descriptionLocaleIdentifier: 'german-eu-company-request-issuer-type-description',
    id: RequestIssuerTypes.GERMAN_EU_COMPANY,
    iconPath: '/german-eu-company-request-issuer-icon.png',
    isEnabled: isEnabledByDefault
  },
  {
    nameLocaleIdentifier: 'international-company-request-issuer-type-name',
    descriptionLocaleIdentifier: 'international-company-request-issuer-type-description',
    id: RequestIssuerTypes.INTERNATIONAL_COMPANY,
    iconPath: '/international-company-request-issuer-icon.png',
    isEnabled: isEnabledByDefault
  },
  {
    nameLocaleIdentifier: 'bank-or-insurance-request-issuer-type-name',
    descriptionLocaleIdentifier: 'bank-or-insurance-request-issuer-type-description',
    id: RequestIssuerTypes.BANK_OR_INSURANCE,
    iconPath: '/bank-or-insurance-request-issuer-icon.svg',
    isEnabled: isEnabledByDefault
  },
  {
    nameLocaleIdentifier: 'union-or-ngo-request-issuer-type-name',
    descriptionLocaleIdentifier: 'union-or-ngo-request-issuer-type-description',
    id: RequestIssuerTypes.UNION_OR_NGO,
    iconPath: '/union-or-ngo-request-issuer-icon.png',
    isEnabled: isEnabledByDefault
  },
  {
    nameLocaleIdentifier: 'private-request-issuer-type-name',
    descriptionLocaleIdentifier: 'private-request-issuer-type-description',
    id: RequestIssuerTypes.PRIVATE,
    iconPath: '/private-request-issuer-icon.svg',
    isEnabled: isEnabledByDefault
  }
];
