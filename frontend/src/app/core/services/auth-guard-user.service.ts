import { Injectable } from '@angular/core';
import {CanActivate, CanActivateChild, Router} from '@angular/router';
import {SessionService} from './session.service';
import {LoggerService} from './logger.service';
import {ToastService} from './toast.service';
import {LocalizationService} from './localization.service';
import {UserRole} from '../../../config/user-roles.config';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardUserService implements CanActivate, CanActivateChild {

  constructor(
    private session: SessionService,
    private router: Router,
    private logger: LoggerService,
    private _toastService: ToastService,
  ) { }

  canActivate() {
    if (this.session.isLoggedIn(UserRole.ENDUSER)) {
      return true;
    } else {
      this._toastService.showToast('You are not authenticated');
      this.router.navigateByUrl('/').catch(error => this.logger.print(error));
    }
  }

  canActivateChild() {
    return this.canActivate();
  }
}
