import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule, MatSnackBarModule
} from "@angular/material";
import { LoginEndUserComponent } from './login-end-user/login-end-user.component';
import { LoginDataProcessorComponent } from './login-data-processor/login-data-processor.component';
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSnackBarModule
  ],
  exports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [LoginEndUserComponent, LoginDataProcessorComponent]
})
export class LoginModule { }
