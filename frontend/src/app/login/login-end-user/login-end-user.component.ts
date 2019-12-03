import {Component, OnInit} from '@angular/core';
import {LoginService} from '../services/login.service';
import {LoggerService} from '../../core/services/logger.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {SessionService} from '../../core/services/session.service';
import {EncryptService} from '../../core/services/encrypt.service';
import {LocalizationService} from '../../core/services/localization.service';
import {ToastService} from '../../core/services/toast.service';
import {UserRole} from '../../../config/user-roles.config';

@Component({
  selector: 'app-login-end-user',
  templateUrl: './login-end-user.component.html',
  styleUrls: ['../login.css', './login-end-user.component.css']
})
export class LoginEndUserComponent implements OnInit {

  constructor(
      private loginService: LoginService,
      private logger: LoggerService,
      private router: Router,
      private session: SessionService,
      public locale: LocalizationService,
      private _toast: ToastService
  ) { }

  ngOnInit() {
  }

  login(formValues) {
    const _encryptedPassword = EncryptService.encryptSHA512(formValues['password']);
    const _dataToBePassed = { 'password': _encryptedPassword};
    this.loginService.loginUser(formValues['username'], _dataToBePassed).then((res: any) => {
      this.logger.print('Login successful. Redirecting to dashboard...');
      this.session.logIn({
        role: UserRole.ENDUSER,
        username: formValues['username'],
        token: res['mynedata-token'],
        encryptedPassword: _encryptedPassword
      });
      this.router.navigateByUrl('/user/(view:dashboard)').catch(error => this.logger.print(error));
    }).catch((error) => {
      // currently a failed http requests doesn't start the fail-routine, only when http gives timeout
      // (that happens when api is up but backend down)

      this._toast.showToast(this.locale.get('toast-login-failed-text'), this.locale.get('toast-login-failed-action-text'), {
        duration: 3000
      });
    });
  }
}
