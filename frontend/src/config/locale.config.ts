interface LocaleConfig {
  default: string;
  fallback: string;
}

export enum SupportedLocales {
  de_DE
}

export const localeConfig: LocaleConfig = {
  default: 'en_US',
  fallback: 'de_DE'
};
