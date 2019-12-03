import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LocalizationService} from './core/services/localization.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSidenavModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {Ng5SliderModule} from 'ng5-slider';
import {PrivacySettingsComponent} from './user-zone/privacy-settings/privacy-settings.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    CoreModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    Ng5SliderModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports : [
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AppModule { }
