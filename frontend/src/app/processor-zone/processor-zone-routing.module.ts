import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProcessorZoneComponent} from './processor-zone.component';
import {AuthGuardProcessorService} from '../core/services/auth-guard-processor.service';
import {DashboardComponent} from './dashboard/dashboard.component';
import {GeneralSettingsComponent} from './general-settings/general-settings.component';
import {QueryComponent} from './query/query.component';

const routes: Routes = [
  {
    path: 'processor',
    component: ProcessorZoneComponent,
    canActivateChild: [AuthGuardProcessorService],
    children: [
      {
        path: '',
        component: DashboardComponent,
        outlet: 'view'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        outlet: 'view'
      },
      {
        path: 'general-settings',
        component: GeneralSettingsComponent,
        outlet: 'view'
      },
      {
        path: 'requests',
        component: QueryComponent,
        outlet: 'view'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class ProcessorZoneRoutingModule { }
