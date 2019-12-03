import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about.component';
import { AboutRoutingModule } from './about-routing.module';
import {
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule, MatRadioModule, MatSelectModule, MatSlideToggleModule,
    MatTabsModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AboutRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    FormsModule,
    SharedModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  declarations: [AboutComponent]
})
export class AboutModule { }
