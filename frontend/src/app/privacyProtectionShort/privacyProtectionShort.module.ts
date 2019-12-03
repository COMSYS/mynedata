import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyProtectionShortComponent } from './privacyProtectionShort.component';
import { PrivacyProtectionShortRoutingModule } from './privacyProtectionShort-routing.module';
import {
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule, MatRadioModule, MatSelectModule, MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    PrivacyProtectionShortRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    FormsModule,
    SharedModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  declarations: [PrivacyProtectionShortComponent]
})
export class PrivacyProtectionShortModule { }
