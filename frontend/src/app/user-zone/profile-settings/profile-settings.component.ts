import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProfileSettingsService} from '../services/profile-settings.service';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';
import {UserProfileRequiredField, requiredFieldsUsers, requiredFieldsAnonUsers} from '../../../config/user-profile.config';
import {LoggerService} from '../../core/services/logger.service';
import {HttpRequestService} from '../../core/services/http-request.service';
import {SessionService} from '../../core/services/session.service';
import {FormGroup} from '@angular/forms';
import {ToastService} from '../../core/services/toast.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  public profile__ = {
    userName: 'I_am_the_MOCKING_bird',
    password: 'mockridge',
    city: 'Mocktown',
    street: 'Mockroad 3324',
    givenName: 'Mocky',
    surname: 'Mockridge',
    postal: '555555'
  };

  public formGroupUpdateProfile;

  public profile;
  private _hasFetchedProfileData: boolean;

  requiredFieldsUsers: UserProfileRequiredField;
  requiredFieldsAnonUsers: UserProfileRequiredField;

  constructor(
      private profileService: ProfileSettingsService,
      private _breadcrumbs: BreadcrumbsService,
      public locale: LocalizationService,
      private _logger: LoggerService,
      private _ajax: HttpRequestService,
      private _session: SessionService,
      private _toastService: ToastService
  ) {
    this.formGroupUpdateProfile = new FormGroup({});
    this.requiredFieldsAnonUsers = requiredFieldsAnonUsers;
    this.requiredFieldsUsers = requiredFieldsUsers;
    this._hasFetchedProfileData = false;
    this._breadcrumbs.moveDown({
      path: this.locale.get('profile-settings-link-header'),
      link: 'profile-settings'
    });
  }

  private async _fetchProfileData() {
    const _username = this._session.getUsername();
    return await this._ajax.get(`/user/${_username}/profile`);
  }

  ngOnInit() {
    this._fetchProfileData().then((_profileData) => {
      this.profile = _profileData;
      this.profile['password'] = this._session.getEncryptedPassword();
      this._hasFetchedProfileData = true;
    });
  }

  ngOnDestroy() {
    this._breadcrumbs.moveUp();
  }

  public saveFieldToDB(field: any): void {
    if (field.value !== this.profile[field.name]) {
      const _username = this._session.getUsername();
      this.profile[field.name] = field.value;
      this._ajax.patch(`/user/${_username}/register`, this.profile).then(() => {
        // in case the ajax was successful, also update the username stored in the SessionService, if it was changed
        if (field.name === 'username' && field.value !== this._session.getUsername()) {
          this._session.patchUsername(field.value);
        }

        this._toastService.showToast(this.locale.get('toast-generic-changes-saved-text'), this.locale.get('toast-generic-confirm-text'));
        this._logger.print(`Updating Profile: patch ${field.name} to ${field.value}`);
      }).catch(error => {
        this._logger.print(`Couldn't update profile information:`);
        this._logger.print(error);
        this._toastService.showToast(this.locale.get('toast-generic-ajax-fail-text'), this.locale.get('toast-generic-ajax-fail-confirm-text'));
      });
    }
  }

  public hasFetchedProfileData(): boolean {
    return this._hasFetchedProfileData;
  }

}
