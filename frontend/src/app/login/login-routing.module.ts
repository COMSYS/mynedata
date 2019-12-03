import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginEndUserComponent} from "./login-end-user/login-end-user.component";
import {LoginDataProcessorComponent} from "./login-data-processor/login-data-processor.component";

const routes: Routes = [
    { path: '', redirectTo: 'user', pathMatch: 'full' },
    { path: 'user', component: LoginEndUserComponent },
    { path: 'processor', component: LoginDataProcessorComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class LoginRoutingModule { }
