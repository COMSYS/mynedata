import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserZoneComponent } from './user-zone.component';
import { UserZoneRoutingModule } from './/user-zone-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule, MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatNativeDateModule, MatPaginatorModule, MatRadioModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule, MatSortModule,
  MatStepperModule,
  MatTableModule, MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { DataSourceSettingsDialogComponent } from './data-source-settings-dialog/data-source-settings-dialog.component';
import { DataSourceChartDialogComponent } from './data-source-chart-dialog/data-source-chart-dialog.component';
import { PrivacySettingsComponent } from './privacy-settings/privacy-settings.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { DataManagementComponent } from './data-management/data-management.component';
import { RequestsComponent } from './requests/requests.component';
import { ChartsComponent } from './charts/charts.component';
import { LittleScoreDisplayComponent } from './little-score-display/little-score-display.component';
import { QuickProfileMenuComponent } from './quick-profile-menu/quick-profile-menu.component';
import { DashboardWidgetDataSourcesComponent } from './dashboard-widgets/dashboard-widget-data-sources/dashboard-widget-data-sources.component';
import { DashboardWidgetMyDataComponent } from './dashboard-widgets/dashboard-widget-my-data/dashboard-widget-my-data.component';
import { DashboardWidgetNotificationsComponent } from './dashboard-widgets/dashboard-widget-notifications/dashboard-widget-notifications.component';
import { DashboardWidgetMySalesComponent } from './dashboard-widgets/dashboard-widget-my-sales/dashboard-widget-my-sales.component';
import { DashboardWidgetMyProfileComponent } from './dashboard-widgets/dashboard-widget-my-profile/dashboard-widget-my-profile.component';
import { DashboardWidgetMyPrivacySettingsComponent } from './dashboard-widgets/dashboard-widget-my-privacy-settings/dashboard-widget-my-privacy-settings.component';
import { DashboardWidgetChartComponent } from './dashboard-widgets/dashboard-widget-chart/dashboard-widget-chart.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import { AddNewDatasourceComponent } from './add-new-datasource/add-new-datasource.component';
import { FirstTimeWizardComponent } from './first-time-wizard/first-time-wizard.component';
import { GlobalPrivacyComponent } from './privacy-settings/global-privacy/global-privacy.component';
import { DataTypesPrivacyComponent } from './privacy-settings/data-types-privacy/data-types-privacy.component';
import { EditDatasourceComponent } from './edit-datasource/edit-datasource.component';
import {Ng5SliderModule} from 'ng5-slider';
import { DatatypeRowComponent } from './datatype-row/datatype-row.component';
import { CheckboxAuthorizeDataUsageExplicitlyComponent } from './privacy-settings/checkbox-authorize-data-usage-explicitly/checkbox-authorize-data-usage-explicitly.component';
import { RequestIssuerPrivacyComponent } from './privacy-settings/request-issuer-privacy/request-issuer-privacy.component';
import { RequestIssuerPrivacyRowComponent } from './privacy-settings/request-issuer-privacy/request-issuer-privacy-row/request-issuer-privacy-row.component';
import { DatasourceDataViewComponent } from './data-management/datasource-data-view/datasource-data-view.component';
import { RequestViewComponent } from './requests/request-view/request-view.component';
import { ScoreComponent } from './score/score.component';
import { ScoreHistoryComponent } from './score/score-history/score-history.component';
import { ScorePayoutComponent } from './score/score-payout/score-payout.component';
import { ScorePayoutVoucherChosenComponent } from './score/score-payout/score-payout-voucher-chosen/score-payout-voucher-chosen.component';
import { ScorePayoutMoneyChosenComponent } from './score/score-payout/score-payout-money-chosen/score-payout-money-chosen.component';
import { ScorePayoutDonationChosenComponent } from './score/score-payout/score-payout-donation-chosen/score-payout-donation-chosen.component';
import { HistoryScoreComponent } from './score/score-history/history-score/history-score.component';
import { HistoryPayoutsComponent } from './score/score-history/history-payouts/history-payouts.component';
import { DashboardWidgetScoreComponent } from './dashboard-widgets/dashboard-widget-score/dashboard-widget-score.component';
import { DashboardWidgetNewServiceComponent } from './dashboard-widgets/dashboard-widget-new-service/dashboard-widget-new-service.component';
import { ToggleDatatypeSharingComponent } from './dashboard-widgets/dashboard-widget-my-privacy-settings/toggle-datatype-sharing/toggle-datatype-sharing.component';
import { ToggleIssuerBusinessSharingComponent } from './dashboard-widgets/dashboard-widget-my-privacy-settings/toggle-issuer-business-sharing/toggle-issuer-business-sharing.component';
import {ChartsModule} from 'ng2-charts-x';
import { DialogWarnSettingPrivaciesComponent } from './privacy-settings/dialog-warn-setting-privacies/dialog-warn-setting-privacies.component';
import { DetailsPinQueryDialogComponent } from './dashboard-widgets/dashboard-widget-new-service/details-pin-query-dialog/details-pin-query-dialog.component';
import {CoreModule} from '../core/core.module';
import {NgxChartsModule} from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    UserZoneRoutingModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSliderModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SharedModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatSortModule,
    MatPaginatorModule,
    Ng5SliderModule,
    MatCheckboxModule,
    MatTabsModule,
    MatBadgeModule,
    MatRadioModule,
    ChartsModule,
    NgxChartsModule
  ],
  exports: [
    QuickProfileMenuComponent,
    LittleScoreDisplayComponent,
    ReactiveFormsModule
  ],
  declarations: [
    UserZoneComponent,
    DashboardComponent,
    ProfileSettingsComponent,
    DataSourceSettingsDialogComponent,
    DataSourceChartDialogComponent,
    PrivacySettingsComponent,
    GeneralSettingsComponent,
    DataManagementComponent,
    RequestsComponent,
    ChartsComponent,
    LittleScoreDisplayComponent,
    QuickProfileMenuComponent,
    DashboardWidgetDataSourcesComponent,
    DashboardWidgetMyDataComponent,
    DashboardWidgetNotificationsComponent,
    DashboardWidgetMySalesComponent,
    DashboardWidgetMyProfileComponent,
    DashboardWidgetMyPrivacySettingsComponent,
    DashboardWidgetChartComponent,
    AddNewDatasourceComponent,
    FirstTimeWizardComponent,
    GlobalPrivacyComponent,
    DataTypesPrivacyComponent,
    EditDatasourceComponent,
    DatatypeRowComponent,
    CheckboxAuthorizeDataUsageExplicitlyComponent,
    RequestIssuerPrivacyComponent,
    RequestIssuerPrivacyRowComponent,
    DatasourceDataViewComponent,
    RequestViewComponent,
    ScoreComponent,
    ScoreHistoryComponent,
    ScorePayoutComponent,
    ScorePayoutVoucherChosenComponent,
    ScorePayoutMoneyChosenComponent,
    ScorePayoutDonationChosenComponent,
    HistoryScoreComponent,
    HistoryPayoutsComponent,
    DashboardWidgetScoreComponent,
    DashboardWidgetNewServiceComponent,
    ToggleDatatypeSharingComponent,
    ToggleIssuerBusinessSharingComponent,
    DialogWarnSettingPrivaciesComponent,
    DetailsPinQueryDialogComponent
    ],
  entryComponents: [
    DataSourceSettingsDialogComponent,
    DataSourceChartDialogComponent,
    AddNewDatasourceComponent,
    FirstTimeWizardComponent,
    EditDatasourceComponent,
    DatasourceDataViewComponent,
    RequestViewComponent,
    DialogWarnSettingPrivaciesComponent,
    DetailsPinQueryDialogComponent
  ]
})
export class UserZoneModule { }
