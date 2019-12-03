import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateAccountRoutingModule } from './create-account-routing.module';
import { CreateAccountComponent } from './create-account.component';
import {
  MatCheckboxModule,
  MatFormFieldModule,
  MatCardModule,
  MatInputModule, MatRadioModule, MatSelectModule, MatSlideToggleModule,
  MatSnackBarModule,
  MatTabsModule, MatButtonModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    CreateAccountRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatCardModule,
    FormsModule,
    SharedModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule
  ],
  declarations: [CreateAccountComponent]
})
export class CreateAccountModule { }
