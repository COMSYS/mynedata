import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyProtectionComponent } from './privacyProtection.component';
import { PrivacyProtectionRoutingModule } from './privacyProtection-routing.module';
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
    PrivacyProtectionRoutingModule,
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
  declarations: [PrivacyProtectionComponent]
})
export class PrivacyProtectionModule { }
