/*
    all paths for images ought to be relative to frontend/src/assets and need to include their file ending
 */

export interface MyneDataLocale {
    // grammar and language
    'basic-and': string;
    'basic-of': string;
    'basic-for': string;
    'basic-or': string;

    // misc
    'breadcrumbs-user-zone-root-text': string;
    'breadcrumbs-divider': string;
    'score-name-singular': string;
    'score-name-plural': string;
    'main-currency-symbol': string;
    'main-currency-name': string;
    'toast-generic-confirm-text': string;
    'toast-generic-changes-saved-text': string;
    'toast-generic-ajax-fail-text': string;
    'toast-generic-ajax-fail-confirm-text': string;
    'anonymity-traffic-light-tooltip': string;
    'anonymity-traffic-light-tooltip-error-retrieving-level': string;
    'anonymity-traffic-light-tooltip-placeholder-privacy-level': string;
    'countries': {
        'germany': string;
        'usa': string;
        'great-britain': string;
    };
    'gender-male': string;
    'gender-female': string;
    'yes': string;
    'no': string;
    'unknown-error-occured': string;

    // privacy slider legends and tooltips
    'predefined-privacy-slider-0-tick-legend': string;
    'predefined-privacy-slider-0-tick-tooltip': string;
    'predefined-privacy-slider-1-tick-legend': string;
    'predefined-privacy-slider-1-tick-tooltip': string;
    'predefined-privacy-slider-2-tick-legend': string;
    'predefined-privacy-slider-2-tick-tooltip': string;
    'predefined-privacy-slider-3-tick-legend': string;
    'predefined-privacy-slider-3-tick-tooltip': string;
    'predefined-privacy-slider-4-tick-legend': string;
    'predefined-privacy-slider-4-tick-tooltip': string;
    'predefined-privacy-slider-5-tick-legend': string;
    'predefined-privacy-slider-5-tick-tooltip': string;

    'datatype-privacy-slider-0-tick-legend': string;
    'datatype-privacy-slider-0-tick-tooltip': string;
    'datatype-privacy-slider-1-tick-legend': string;
    'datatype-privacy-slider-1-tick-tooltip': string;
    'datatype-privacy-slider-2-tick-legend': string;
    'datatype-privacy-slider-2-tick-tooltip': string;
    'datatype-privacy-slider-3-tick-legend': string;
    'datatype-privacy-slider-3-tick-tooltip': string;


    // wizard
    'wizard-title-please-adjust-privacy': string;
    'wizard-subtext-please-adjust-privacy': string;
    'wizard-button-skip-for-now-text': string;

    // header
    'mynedata-logo-path': string;
    'login-link-header': string;
    'logout-link-header': string;
    'register-link-header': string;
    'about-link-header': string;
    'profile-settings-link-header': string;
    'score-display-text-singular': string;
    'score-display-text-plural': string;
    'score-display-placeholder': string;
    'score-display-last-updated-text': string;
    'score-display-update-button-tooltip-text': string;

    // sidenav
    'dashboard-link-text-sidenav': string;
    'privacy-settings-link-text-sidenav': string;
    'data-management-link-text-sidenav': string;
    'requests-link-text-sidenav': string;
    'score-link-text-sidenav': string;
    'charts-link-text-sidenav': string;
    'general-settings-link-text-sidenav': string;

    // toast when login fails
    'toast-login-failed-text': string;
    'toast-login-failed-action-text': string;

    // toast for trying to reach a auth-guard protected site but the visitor is not logged in
    'toast-not-logged-in-text': string;
    'toast-not-logged-in-action-text': string;

    // login page for normal users
    'login-button-login-user': string;
    'switch-role-login-user': string;
    'title-form-login-user': string;
    'placeholder-name-form-login-user': string;
    'placeholder-password-form-login-user': string;

    // login page for data processors
    'login-button-login-processor': string;
    'switch-role-login-processor': string;
    'title-form-login-processor': string;
    'placeholder-name-form-login-processor': string;
    'placeholder-password-form-login-processor': string;

    // registration page
    'register-anonymously-register-user': string;
    'register-anonymously-info': string;
    'title-tab-register-user': string;
    'title-tab-register-processor': string;
    // for the placeholders, see 'profile fields for users' in this file
    'register-button-register-user': string;
    'password-mismatch-register-user': string;
    'not-valid-email-address': string;
    'toast-registered-successfully-text': string;
    'toast-registered-successfully-action-text': string;
    'toast-registering-failed-text': string;
    'toast-registering-failed-action-text': string;

    // add new datasource
    'add-datasource-floating-fab-button-tooltip': string;
    'add-datasource-name-placeholder': string;
    'add-datasource-privacy-level-label': string;
    'add-datasource-submit-button-text': string;
    'add-datasource-granularity-label': string;
    'add-datasource-granularity-time-scales-preceding-word-for-every': string;
    'add-datasource-granularity-time-scales-seconds-singular': string;
    'add-datasource-granularity-time-scales-seconds-plural': string;
    'add-datasource-granularity-time-scales-minutes-singular': string;
    'add-datasource-granularity-time-scales-minutes-plural': string;
    'add-datasource-granularity-time-scales-hours-singular': string;
    'add-datasource-granularity-time-scales-hours-plural': string;
    'add-datasource-granularity-time-scales-days-singular': string;
    'add-datasource-granularity-time-scales-days-plural': string;
    'add-datasource-granularity-time-scales-weeks-singular': string;
    'add-datasource-granularity-time-scales-weeks-plural': string;
    'add-datasource-granularity-time-scales-months-singular': string;
    'add-datasource-granularity-time-scales-months-plural': string;
    'add-datasource-granularity-time-scales-years-singular': string;
    'add-datasource-granularity-time-scales-years-plural': string;
    'add-datasource-granularity-time-scales-decades-singular': string;
    'add-datasource-granularity-time-scales-decades-plural': string;
    'add-datasource-granularity-time-scales-centuries-singular': string;
    'add-datasource-granularity-time-scales-centuries-plural': string;
    'add-datasource-granularity-time-scales-millenia-singular': string;
    'add-datasource-granularity-time-scales-millenia-plural': string;
    'add-datasource-granularity-choose-time-scale-placeholder': string;
    'add-datasource-granularity-frequency-placeholder': string;
    'add-datasource-upload-granularity-placeholder'?: string;
    'add-datasource-upload-toast-placeholder-name': string;
    'add-datasource-upload-toast-text': string;
    'add-datasource-force-manual-privacy': string;
    'add-datasource-your-privacy-score': string;
    'add-datasource-no-further-datasource-available': string;

    // profile fields for users
    'placeholder-username-user-profile': string;
    'placeholder-first-name-user-profile': string;
    'placeholder-last-name-user-profile': string;
    'placeholder-password-user-profile': string;
    'placeholder-password-confirmation-user-profile': string;
    'label-birthday-user-profile': string;
    'placeholder-street-user-profile': string;
    'placeholder-postal-user-profile': string;
    'placeholder-city-user-profile': string;
    'placeholder-country-of-origin-user-profile': string;
    'label-gender-user-profile': string;
    'placeholder-email-user-profile': string;

    // dashboard widgets
    'dashboard-widget-connected-data-sources-title': string;
    'dashboard-widget-connected-data-sources-go-to-management-button-text': string;

    'dashboard-widget-my-shared-data-title': string;

    'dashboard-widget-requests-and-notifications-title': string;
    'dashboard-widget-requests-none-available-text': string;
    'dashboard-widget-requests-reward-not-a-number-text': string;

    'dashboard-widget-my-sales-title': string;
    'dashboard-widget-my-sales-score-this-week-text-singular': string;
    'dashboard-widget-my-sales-score-this-week-text-plural': string;
    'dashboard-widget-my-sales-score-this-week-placeholder': string;
    'dashboard-widget-my-sales-sales-this-week-text-singular': string;
    'dashboard-widget-my-sales-sales-this-week-text-plural': string;
    'dashboard-widget-my-sales-sales-this-week-placeholder': string;


    'dashboard-widget-my-score-you-have-so-many-points': string;
    'dashboard-widget-my-score-they-are-worth-so-much': string;
    'dashboard-widget-my-score-button-payout-text': string;

    'dashboard-widget-my-privacy-settings-title': string;
    'dashboard-widget-my-privacy-settings-following-data-shared-text': string;
    'dashboard-widget-my-privacy-settings-following-request-issuers-shared-text': string;
    'dashboard-widget-my-privacy-settings-toast-datatype-disabled': string;
    'dashboard-widget-my-privacy-settings-toast-datatype-enabled': string;
    'dashboard-widget-my-privacy-settings-toast-issuer-disabled': string;
    'dashboard-widget-my-privacy-settings-toast-issuer-enabled': string;
    'dashboard-widget-my-privacy-settings-data-shared-only-with-consent': string;
    'dashboard-widget-my-privacy-settings-data-shared-not-only-with-consent': string;
    'dashboard-widget-my-privacy-settings-button-go-to-settings-text': string;

    'dashboard-widget-my-charts-title': string;
    'dashboard-widget-my-charts-choose-date-start-text': string;
    'dashboard-widget-my-charts-choose-date-end-text': string;
    'dashboard-widget-my-charts-choose-datatype-text': string;
    'dashboard-widget-my-charts-create-diagram-text': string;

    // string related to the history service
    'history-action-request-declined-toast-text': string;
    'history-action-request-accepted-toast-text': string;
    'history-action-request-toast-placeholder-vendor': string;
    'history-action-request-toast-placeholder-score': string;
    'history-action-request-toast-placeholder-score-name': string;

    // requests
    'request-by-vendor-text': string;
    'request-by-vendor-placeholder-vendor': string;
    'request-dialog-action-decide-later': string;
    'request-dialog-action-accept': string;
    'request-dialog-action-decline': string;
    'request-dialog-action-close-window': string;
    'request-available-requests-title': string;
    'request-active-requests-title': string;
    'request-completed-requests-title': string;
    'request-aborted-requests-title': string;
    'request-paid-requests-title': string;
    'request-declined-requests-title': string;
    'request-tables-header-issuer-name': string;
    'request-tables-header-request-title': string;
    'request-tables-header-reward': string;
    'request-dialog-reward-text': string;
    'request-dialog-business-branch-text': string;
    'request-dialog-website-link-text': string;
    'request-dialog-the-offer-text': string;
    'request-dialog-offer-for-what-text': string;
    'request-dialog-offer-what-for-text': string;
    'request-dialog-description-text': string;
    'request-dialog-duration-text': string;
    'request-dialog-duration-placeholder': string;
    'request-dialog-duration-until-revoked-text': string;
    'request-accepted-toast': string;
    'request-declined-toast': string;
    'request-new-service-title-text': string;
    'request-new-service-description-text': string;
    'request-new-service-pin': string;
    'request-new-service-error-pin-unknown': string;
    'request-new-service-connect-with-service-provider-button-text': string;

    // data types
    'medical-data-type-name': string;
    'personal-data-type-name': string;
    'smart-home-data-type-name': string;
    'location-data-type-name': string;
    'online-activity-data-type-name': string;
    'consumer-data-type-name': string;
    'miscellaneous-data-type-name': string;

    // data types usage/used by description
    'medical-data-type-description': string;
    'personal-data-type-description': string;
    'location-data-type-description': string;
    'smart-home-data-type-description': string;
    'online-activity-data-type-description': string;
    'miscellaneous-data-type-description': string;
    'consumer-data-type-description': string;

    // request issuer types
    'science-request-issuer-type-name': string;
    'government-request-issuer-type-name': string;
    'german-eu-company-request-issuer-type-name': string;
    'international-company-request-issuer-type-name': string;
    'bank-or-insurance-request-issuer-type-name': string;
    'union-or-ngo-request-issuer-type-name': string;
    'private-request-issuer-type-name': string;

    // request issuer types descriptions
    'science-request-issuer-type-description': string;
    'government-request-issuer-type-description': string;
    'german-eu-company-request-issuer-type-description': string;
    'international-company-request-issuer-type-description': string;
    'bank-or-insurance-request-issuer-type-description': string;
    'union-or-ngo-request-issuer-type-description': string;
    'private-request-issuer-type-description': string;
    'show-more-issuer-type-description': string;

    // privacy settings
    'privacy-settings-global-title': string;
    'privacy-settings-global-subtext': string;
    'privacy-settings-datatypes-title': string;
    'privacy-settings-datatypes-subtext': string;
    'privacy-settings-datatypes-link-more-info': string;
    'privacy-settings-explicit-authorization-link-notification-settings': string;
    'privacy-settings-explicit-authorization-checkbox-label': string;
    'privacy-settings-explicit-save-button-text': string;
    'privacy-settings-accept-overwrite-of-custom-privacies-text': string;


    // data management component
    'data-management-component-table-header-name': string;
    'data-management-component-table-header-datatypes': string;
    'data-management-component-table-header-upload-interval': string;
    'data-management-component-table-header-privacy': string;
    'data-management-component-table-header-edit': string;
    'data-management-component-table-header-more-info': string;
    'data-management-component-table-header-remove': string;
    'data-management-component-edit-datasource-submit-button-text': string;
    'data-management-component-table-items-per-page-text': string;
    'data-management-component-table-next-page-text': string;
    'data-management-component-table-previous-page-text': string;
    'data-management-component-table-row-tooltip-edit': string;
    'data-management-component-table-row-tooltip-show-info': string;
    'data-management-component-table-row-tooltip-unregister': string;

    // data view component
    'data-view-component-date-from-placeholder': string;
    'data-view-component-date-until-placeholder': string;
    'data-view-component-tab-raw-data-label': string;
    'data-view-component-tab-chart-label': string;
    'data-view-component-table-raw-data-date-header': string;
    'data-view-component-table-raw-data-time-header': string;
    'data-view-component-button-close-dialog-text': string;
    'data-view-component-label-sensor-dropdown': string;
    'data-view-component-placeholder-no-sensor-available': string;

    // data view charts
    'data-view-charts-component-selected-attributes-placeholder': string;

    // about-page
    'about-heading-data-precious': string;
    'about-heading-control': string;
    'about-heading-privacy': string;
    'about-heading-money': string;
    'about-heading-motivation': string;
    'about-heading-target': string;
    'about-heading-whoarewe': string;
    'about-heading-principle': string;

    'about-text-data-precious': string;
    'about-text-control': string;
    'about-text-privacy': string;
    'about-text-money': string;
    'about-text-motivation': string;
    'about-text-target': string;
    'about-text-whoarewe': string;
    'about-text-principle': string;

    // privacyProtectionPage

    'privacy-protection-heading-how-we-protect': string;
    'privacy-protection-heading-what-anonymity': string;
    'privacy-protection-heading-example': string;
    'privacy-protection-heading-privacy-at-mynedata': string;
    'privacy-protection-heading-k-anonymity': string;
    'privacy-protection-heading-dif-privacy': string;
    'privacy-protection-heading-privacy-level-at-mynedata': string;
    'privacy-protection-heading-level-1': string;
    'privacy-protection-heading-level-2': string;
    'privacy-protection-heading-level-3': string;
    'privacy-protection-heading-annotation': string;

    'privacy-protection-text-how-we-protect-1': string;
    'privacy-protection-text-how-we-protect-2': string;
    'privacy-protection-text-what-anonymity': string;
    'privacy-protection-text-example1': string;
    'privacy-protection-text-privacy-at-mynedata': string;
    'privacy-protection-text-k-anonymity': string;
    'privacy-protection-text-example2': string;
    'privacy-protection-text-dif-privacy1': string;
    'privacy-protection-text-dif-privacy2': string;
    'privacy-protection-text-example21': string;
    'privacy-protection-text-example22': string;
    'privacy-protection-text-privacy-level-at-mynedata': string;
    'privacy-protection-text-level-11': string;
    'privacy-protection-text-level-12': string;
    'privacy-protection-text-level-21': string;
    'privacy-protection-text-level-22': string;
    'privacy-protection-text-level-3': string;
    'privacy-protection-text-annotation': string;

    'privacy-protection-text-and': string;
    'privacy-protection-text-to': string;

    'privacy-protection-table-name': string;
    'privacy-protection-table-postcode': string;
    'privacy-protection-table-age': string;
    'privacy-protection-table-gender': string;
    'privacy-protection-table-other-data': string;
    'privacy-protection-table-male': string;

    'privacy-protection-link-k-anonymity': string;
    'privacy-protection-link-dif-priv': string;
    'privacy-protection-link-full': string;

    // score-payout

    'score-payout-payout': string;
    'score-payout-minimum': string;
    'score-payout-voucher': string;
    'score-payout-cadooz': string;
    'score-payout-donate': string;
    'score-payout-donate-more': string;

    'score-payout-back': string;

    // history-payouts
    'history-payouts-payouts': string;
    'history-payouts-sum': string;
    'history-payouts-donated-to': string;
    'history-payouts-transferred': string;
    'history-payouts-ordered-voucher': string;
    'history-payouts-previous': string;

    // register query (as processor)
    'register-query-form-placeholder-query-string': string;
    'register-query-form-placeholder-reward': string;
    'register-query-form-placeholder-min-amount-users': string;
    'register-query-form-placeholder-granularity': string;
    'register-query-form-placeholder-max-privacy': string;
    'register-query-form-label-interval-time': string;
    'register-query-form-placeholder-interval-time-start': string;
    'register-query-form-placeholder-interval-time-end': string;
    'register-query-form-label-consent-time': string;
    'register-query-form-placeholder-consent-time-start': string;
    'register-query-form-placeholder-consent-time-end': string;
    'register-query-form-button-register-query': string;
    'register-query-confirmation-query-registered': string;
}
