export enum DataTypes {
    PERSONAL,
    LOCATION,
    MEDICAL,
    SMART_HOME,
    ONLINE_ACTIVITY,
    CONSUMER
}

export interface DataType {
    nameLocaleIdentifier: string;
    descriptionLocaleIdentifier: string;
    id: DataTypes;
    iconPath: string;
    privacy?: number;
    isEnabled: boolean;
}

const isEnabledByDefault = false;

export const datatypesConfigs: DataType[] = [
    {
        nameLocaleIdentifier: 'medical-data-type-name',
        descriptionLocaleIdentifier: 'medical-data-type-description',
        id: DataTypes.MEDICAL,
        iconPath: '/medical-data-icon.svg',
        isEnabled: isEnabledByDefault
    },
    {
        nameLocaleIdentifier: 'location-data-type-name',
        descriptionLocaleIdentifier: 'location-data-type-description',
        id: DataTypes.LOCATION,
        iconPath: '/location-data-icon.svg',
        isEnabled: isEnabledByDefault
    },
    {
        nameLocaleIdentifier: 'personal-data-type-name',
        descriptionLocaleIdentifier: 'personal-data-type-description',
        id: DataTypes.PERSONAL,
        iconPath: '/personal-data-icon.svg',
        isEnabled: isEnabledByDefault
    },
    {
        nameLocaleIdentifier: 'smart-home-data-type-name',
        descriptionLocaleIdentifier: 'smart-home-data-type-description',
        id: DataTypes.SMART_HOME,
        iconPath: '/smart-home-data-icon.svg',
        isEnabled: isEnabledByDefault
    },
    {
        nameLocaleIdentifier: 'online-activity-data-type-name',
        descriptionLocaleIdentifier: 'online-activity-data-type-description',
        id: DataTypes.ONLINE_ACTIVITY,
        iconPath: '/online-activity-data-icon.svg',
        isEnabled: isEnabledByDefault
    },
    {
        nameLocaleIdentifier: 'consumer-data-type-name',
        descriptionLocaleIdentifier: 'consumer-data-type-description',
        id: DataTypes.CONSUMER,
        iconPath: '/consumer-data-icon.svg',
        isEnabled: isEnabledByDefault
    }
];
