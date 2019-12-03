import {Injectable, OnDestroy} from '@angular/core';
import {LoggerService} from './logger.service';
import {Router} from '@angular/router';
import {LogoutService} from './logout.service';
import {AuthenticationService} from './authentication.service';
import {AddNewDatasourceComponent} from '../../user-zone/add-new-datasource/add-new-datasource.component';
import {UserRole} from '../../../config/user-roles.config';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  private _loggedIn: boolean;
  private _role: UserRole = undefined;
  private _username: string;
  private _hasDoneIntroductionWizard: boolean;
  private _globalPrivacy: number;
  private _encryptedPassword: string;

  constructor(
      private logger: LoggerService,
      private logout: LogoutService,
      private router: Router,
      private _authenticationService: AuthenticationService
  ) {
    this._hasDoneIntroductionWizard = false;
    this._loggedIn = false;
  }

  ngOnDestroy(): void {
    this._loggedIn = undefined;
    this._role = undefined;
    this._username = undefined;
    this._hasDoneIntroductionWizard = undefined;
    this._globalPrivacy = undefined;
    this._encryptedPassword = undefined;
    this.logger = undefined;
    this.logout = undefined;
    this.router = undefined;
    this._authenticationService = undefined;
  }

  /**
   * if the logged in user is of a different _role than the param provided, it returns 'false' regardless whether the
   * user is logged in or not. If no _role provided, this method simply checks if the user is logged in at all.
   * @param {UserRole} role optional, but heavily used.
   * @returns {boolean}
   */
  isLoggedIn(role?: UserRole): boolean {
    if (role) {
      return this._loggedIn && (role === this._role);
    } else {
      return this._loggedIn;
    }
  }

  logIn(params: {role: UserRole, username: string, token: string, encryptedPassword: string}): void {
    this.logger.print(`Logging in, setting role to ${params.role}, username to '${params.username}' and token to '${params.token}'`);
    this._username = params.username;
    this._authenticationService.token = params.token;
    this._encryptedPassword = params.encryptedPassword;
    this._role = params.role;
    this._loggedIn = true;
  }

  isLoggedInAs(role): boolean {
    return role === this._role;
  }

  getRole(): UserRole {
    return this._role;
  }

  destroySession(): void {
    this.logout.logout(this._username, {'mynedata-token': this._authenticationService.token}, this.getRole()).then(() => {
      this._deepDestroy();
      this.router.navigateByUrl('/').catch(error => this.logger.print(error));
    }).catch((error) => this.logger.print(error));
  }

  private _deepDestroy(): void {
    this._loggedIn = false;
    this._role = undefined;
    this._username = undefined;
    this._authenticationService.token = undefined;
  }

  public getUsername(): string {
    return this._username;
  }

  public getEncryptedPassword(): string {
    return this._encryptedPassword;
  }

  public patchUsername(newName: string) {
    this._username = newName;
  }
}
