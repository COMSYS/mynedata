import {DataTypes} from './data-types.config';

export interface PredefinedPrivacyLevelsConfig {
  [key: string]: {
    explicitlyAuthorizeUsageOfData: boolean;
    datatypesPrivacies: {
      [key: number]: number;
    };
  };
}

export enum PredefinedPrivacyLevels {
  DONT_SHARE_DATA,
  DONT_SHARE_SENSITIVE_DATA,
  DONT_SHARE_HIGHLY_SENSITIVE_DATA,
  STRONGLY_PROTECT_SENSITIVE_DATA,
  PROTECT_DATA_APPROPRIATELY
}

export const predefinedPrivacyLevelsConfig: PredefinedPrivacyLevelsConfig = {
  [PredefinedPrivacyLevels.DONT_SHARE_DATA]: {
    explicitlyAuthorizeUsageOfData: true,
    datatypesPrivacies: {
      [DataTypes.PERSONAL]: 0,
      [DataTypes.LOCATION]: 0,
      [DataTypes.MEDICAL]: 0,
      [DataTypes.SMART_HOME]: 0,
      [DataTypes.ONLINE_ACTIVITY]: 0,
      [DataTypes.CONSUMER]: 0
    }
  },
  [PredefinedPrivacyLevels.DONT_SHARE_SENSITIVE_DATA]: {
    explicitlyAuthorizeUsageOfData: true,
    datatypesPrivacies: {
      [DataTypes.PERSONAL]: 1,
      [DataTypes.LOCATION]: 1,
      [DataTypes.MEDICAL]: 0,
      [DataTypes.SMART_HOME]: 0,
      [DataTypes.ONLINE_ACTIVITY]: 0,
      [DataTypes.CONSUMER]: 1
    }
  },
  [PredefinedPrivacyLevels.DONT_SHARE_HIGHLY_SENSITIVE_DATA]: {
    explicitlyAuthorizeUsageOfData: true,
    datatypesPrivacies: {
      [DataTypes.PERSONAL]: 2,
      [DataTypes.LOCATION]: 1,
      [DataTypes.MEDICAL]: 0,
      [DataTypes.SMART_HOME]: 1,
      [DataTypes.ONLINE_ACTIVITY]: 0,
      [DataTypes.CONSUMER]: 2
    }
  },
  [PredefinedPrivacyLevels.STRONGLY_PROTECT_SENSITIVE_DATA]: {
    explicitlyAuthorizeUsageOfData: true,
    datatypesPrivacies: {
      [DataTypes.PERSONAL]: 3,
      [DataTypes.LOCATION]: 2,
      [DataTypes.MEDICAL]: 1,
      [DataTypes.SMART_HOME]: 1,
      [DataTypes.ONLINE_ACTIVITY]: 2,
      [DataTypes.CONSUMER]: 2
    }
  },
  [PredefinedPrivacyLevels.PROTECT_DATA_APPROPRIATELY]: {
    explicitlyAuthorizeUsageOfData: false,
    datatypesPrivacies: {
      [DataTypes.PERSONAL]: 3,
      [DataTypes.LOCATION]: 2,
      [DataTypes.MEDICAL]: 2,
      [DataTypes.SMART_HOME]: 3,
      [DataTypes.ONLINE_ACTIVITY]: 3,
      [DataTypes.CONSUMER]: 3
    }
  }
};
