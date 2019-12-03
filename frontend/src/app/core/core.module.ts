import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreRoutingModule } from './core-routing.module';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoggerService} from './services/logger.service';
import {SessionService} from './services/session.service';
import {MockerService} from './services/mocker.service';
import {LocalizationService} from './services/localization.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import {UserZoneModule} from '../user-zone/user-zone.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AuthenticationService} from './services/authentication.service';
import {BreadcrumbsService} from './services/breadcrumbs.service';
import {DataTypesService} from './services/data-types.service';
import { CheckOnceDirective } from './directives/check-once.directive';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RequestIssuerService} from './services/request-issuer.service';
import {RequestsService} from './services/requests.service';
import {ToastService} from './services/toast.service';
import { GeneralSettingsHeaderLinkComponent } from './header/general-settings-header-link/general-settings-header-link.component';
import {ProcessorZoneModule} from '../processor-zone/processor-zone.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    CoreRoutingModule,
    MatToolbarModule,
    MatSnackBarModule,
    UserZoneModule,
    ProcessorZoneModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatBadgeModule,
    MatCardModule
  ],
  exports: [
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    MatToolbarModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [HeaderComponent, SidebarComponent, CheckOnceDirective, GeneralSettingsHeaderLinkComponent],
  providers: [
    LoggerService,
    SessionService,
    MockerService,
    LocalizationService,
    AuthenticationService,
    BreadcrumbsService,
    DataTypesService,
    RequestIssuerService,
    RequestsService,
    ToastService
  ]
})
export class CoreModule { }
