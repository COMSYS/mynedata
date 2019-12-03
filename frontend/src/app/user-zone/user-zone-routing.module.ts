import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {UserZoneComponent} from './user-zone.component';
import {AuthGuardUserService} from '../core/services/auth-guard-user.service';
import {PrivacySettingsComponent} from './privacy-settings/privacy-settings.component';
import {DataManagementComponent} from './data-management/data-management.component';
import {RequestsComponent} from './requests/requests.component';
import {ChartsComponent} from './charts/charts.component';
import {GeneralSettingsComponent} from './general-settings/general-settings.component';
import {ProfileSettingsComponent} from './profile-settings/profile-settings.component';
import {ScoreComponent} from './score/score.component';

const routes: Routes = [
    { path: 'user',
      component: UserZoneComponent,
      canActivateChild: [AuthGuardUserService],
      children: [
        { path: '', component: DashboardComponent, outlet: 'view'},
        { path: 'dashboard', component: DashboardComponent, outlet: 'view'},
        { path: 'privacy-settings', component: PrivacySettingsComponent, outlet: 'view'},
        { path: 'data-management', component: DataManagementComponent, outlet: 'view'},
        { path: 'requests', component: RequestsComponent, outlet: 'view'},
        { path: 'charts', component: ChartsComponent, outlet: 'view'},
        { path: 'general-settings', component: GeneralSettingsComponent, outlet: 'view'},
        { path: 'profile-settings', component: ProfileSettingsComponent, outlet: 'view'},
        { path: 'score', component: ScoreComponent, outlet: 'view'}
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
export class UserZoneRoutingModule { }
