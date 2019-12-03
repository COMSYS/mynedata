import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { PrivacyProtectionShortComponent } from "./privacyProtectionShort.component";

const routes: Routes = [
  {
    path: '',
    component: PrivacyProtectionShortComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class PrivacyProtectionShortRoutingModule { }
