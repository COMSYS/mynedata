import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { PrivacyProtectionComponent } from "./privacyProtection.component";

const routes: Routes = [
  {
    path: '',
    component: PrivacyProtectionComponent,
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
export class PrivacyProtectionRoutingModule { }
