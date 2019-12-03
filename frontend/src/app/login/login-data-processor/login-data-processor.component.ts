import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../core/services/localization.service';
import {EncryptService} from '../../core/services/encrypt.service';
import {SessionService} from '../../core/services/session.service';
import {LoginService} from '../services/login.service';
import {LoggerService} from '../../core/services/logger.service';
import {Router} from '@angular/router';
import {ToastService} from '../../core/services/toast.service';
import {UserRole} from '../../../config/user-roles.config';

@Component({
  selector: 'app-login-data-processor',
  templateUrl: './login-data-processor.component.html',
  styleUrls: ['../login.css', './login-data-processor.component.css']
})
export class LoginDataProcessorComponent implements OnInit {

  constructor(
    public locale: LocalizationService,
    private loginService: LoginService,
    private logger: LoggerService,
    private router: Router,
    private session: SessionService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
  }

  login(formValues) {
    const _encryptedPassword = EncryptService.encryptSHA512(formValues['password']);
    const _dataToBePassed = { 'password': _encryptedPassword};
    this.loginService.loginProcessor(formValues['username'], _dataToBePassed).then((res: string) => {
      this.logger.print('Login successful. Redirecting to dashboard...');
      let res_parsed = JSON.parse(res);
      this.session.logIn({
        role: UserRole.DATAPROCESSOR,
        username: formValues['username'],
        token: res_parsed['mynedata-token'],
        encryptedPassword: _encryptedPassword
      });
      this.router.navigateByUrl('/processor/(view:dashboard)').catch(error => this.logger.print(error));
    }).catch((error) => {
      this._toast.showToast(this.locale.get('toast-login-failed-text'), this.locale.get('toast-login-failed-action-text'), {
        duration: 3000
      });
    });
  }

}
