import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequiredLabelDirective } from './directives/required-label.directive';
import {EqualValidatorDirective} from './directives/equal-validator.directive';
import {BreadcrumbsComponent} from './breadcrumbs/breadcrumbs.component';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatButtonModule,
  MatIconModule, MatSelectModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {FabSimpleComponent} from './fab-simple/fab-simple.component';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {RandomDataChartComponent} from './charts/random-data-chart/random-data-chart.component';
import {ChartsModule} from 'ng2-charts-x';
import { OpenhabSensorChartComponent } from './charts/openhab-sensor-chart/openhab-sensor-chart.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ChartsModule,
    MatSelectModule,
    NgxChartsModule
  ],
  declarations: [
    RequiredLabelDirective,
    EqualValidatorDirective,
    BreadcrumbsComponent,
    FabSimpleComponent,
    RandomDataChartComponent,
    OpenhabSensorChartComponent
  ],
  exports: [
    RequiredLabelDirective,
    EqualValidatorDirective,
    BreadcrumbsComponent,
    FabSimpleComponent,
    RandomDataChartComponent,
    OpenhabSensorChartComponent
  ],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'de'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class SharedModule { }
