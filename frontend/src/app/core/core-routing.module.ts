import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {UserZoneComponent} from '../user-zone/user-zone.component';
import {ProcessorZoneComponent} from '../processor-zone/processor-zone.component';
import {AuthGuardUserService} from './services/auth-guard-user.service';
import {AuthGuardProcessorService} from './services/auth-guard-processor.service';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'about',
        pathMatch: 'full'
    },
    {
        path: 'register',
        loadChildren: '../create-account/create-account.module#CreateAccountModule'
    },
    {
        path: 'login',
        loadChildren: '../login/login.module#LoginModule'
    },
    {
        path: 'user',
        loadChildren: '../user-zone/user-zone.module#UserZoneModule',
        canActivate: [AuthGuardUserService]
    },
    {
        path: 'processor',
        loadChildren: '../processor-zone/processor-zone.module#ProcessorZoneModule',
        canActivate: [AuthGuardProcessorService]
    },
    {
        path: 'about',
        loadChildren: '../about/about.module#AboutModule'
    },
    { 
        path: 'privprot',
        loadChildren: '../privacyProtection/privacyProtection.module#PrivacyProtectionModule'
    },
    { 
        path: 'privprotshort',
        loadChildren: '../privacyProtectionShort/privacyProtectionShort.module#PrivacyProtectionShortModule'
    }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class CoreRoutingModule { }
