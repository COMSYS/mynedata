import { NgModule } from '@angular/core';
import {MatButtonToggleModule, MatDialogModule, MatIconModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { ProcessorZoneComponent } from './processor-zone.component';
import { ProcessorZoneRoutingModule } from './/processor-zone-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { QueryComponent } from './query/query.component';
import { CreateQueryComponent } from './query/create-query/create-query.component';
import { QuickProfileMenuComponent } from './quick-profile-menu/quick-profile-menu.component';
import {
  DateAdapter, MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatButtonModule,
  MatDatepickerModule,
  MatInputModule,
  MatMenuModule,
  MatTabsModule,
  MatTableModule,
  MatPaginatorModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import { CreatePinQueryComponent } from './query/create-pin-query/create-pin-query.component';
import { AddQueryByTypeSpeedDialFabComponent } from './query/add-query-by-type-speed-dial-fab/add-query-by-type-speed-dial-fab.component';
import { DialogRegisterNewQueryComponent } from './query/dialog-register-new-query/dialog-register-new-query.component';
import {SharedModule} from '../shared/shared.module';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import { PinQueryDialogComponent } from './query/create-pin-query/pin-query-dialog/pin-query-dialog.component';
import {QueryInfoDialogComponent } from './query/query-info-dialog/query-info-dialog.component';
@NgModule({
  imports: [
    CommonModule,
    ProcessorZoneRoutingModule,
    FlexLayoutModule,
    MatMenuModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTabsModule,
    SharedModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatIconModule
  ],
  exports: [
    QuickProfileMenuComponent
  ],
  declarations: [ProcessorZoneComponent, DashboardComponent, GeneralSettingsComponent, QueryComponent, CreateQueryComponent, QuickProfileMenuComponent, CreatePinQueryComponent, AddQueryByTypeSpeedDialFabComponent, DialogRegisterNewQueryComponent,
    PinQueryDialogComponent, QueryInfoDialogComponent],
  entryComponents: [
    DialogRegisterNewQueryComponent,
    PinQueryDialogComponent,
    QueryInfoDialogComponent
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
export class ProcessorZoneModule { }
