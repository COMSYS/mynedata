// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiPath: 'http://127.0.0.1:14200',
  apiBaseURL: '/api/v2',
  devMode: true,
  locale: {
    default: 'en_US',
    fallback: 'de_DE'
  }
};
