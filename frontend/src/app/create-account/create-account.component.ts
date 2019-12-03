import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {FormControl, FormGroup, NgForm, ValidationErrors, Validator, Validators} from '@angular/forms';
import {CreateAccountService} from './services/create-account.service';
import {LoggerService} from '../core/services/logger.service';
import {Router} from '@angular/router';
import {EncryptService} from '../core/services/encrypt.service';
import {LocalizationService} from '../core/services/localization.service';
import {UserProfileRequiredField, Gender, requiredFieldsUsers, requiredFieldsAnonUsers} from '../../config/user-profile.config';
import {DataProcessorProfileRequiredField, requiredFieldsDataProcessors} from '../../config/data-processor-profile.config';
import {ToastService} from '../core/services/toast.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit, AfterViewInit {
  @ViewChild('registerForm') registerForm: NgForm;
  errors: { [key: string]: string } = {};
  registeringUser: {[key: string]: string | Array<String> } = {
    username: undefined,
    data: []
  };
  registeringDataProcessor: {[key: string]: string | Array<String> } = {
      username: undefined,
      data: []
  };
  requiredFieldsUsers: UserProfileRequiredField;
  requiredFieldsDataProcessors: DataProcessorProfileRequiredField;
  requiredFieldsAnonUsers: UserProfileRequiredField;
  registerAnonymously: boolean;

  public gender = Gender;

  private _submittedToForceValidation = false;


  public formGroupUserRegistration: FormGroup = new FormGroup({});
  public formGroupProcessorRegistration: FormGroup = new FormGroup({});


  constructor(private registerService: CreateAccountService,
              private logger: LoggerService,
              private router: Router,
              public locale: LocalizationService,
              private _toastService: ToastService
  ) {
    this.registerAnonymously = false;
    this.requiredFieldsUsers = requiredFieldsUsers;
    this.requiredFieldsAnonUsers = requiredFieldsAnonUsers;
    this.requiredFieldsDataProcessors = requiredFieldsDataProcessors;
  }

  ngOnInit() {
    this._initFormGroupUserRegistration();
    this._initFormGroupProcessorRegistration();
  }

  ngAfterViewInit() {
  }

  updateErrorMessages() {
  }

  onFormChange(): void {
  }

  register(isDataProcessor: boolean = false) {
    if (!isDataProcessor) {
      const form = this.formGroupUserRegistration;
      this.registerService.registerUser(form.value['account']['username'] as String, this._sanitizeFormValues(form.value)).then((res: Object) => {
        this._toastService.showToast(this.locale.get('toast-registered-successfully-text'), this.locale.get('toast-registered-successfully-action-text'));
        this.logger.print('Redirecting to login page...');
        this.router.navigateByUrl('/login/user').catch(error => this.logger.print(error));
      }).catch((error) => {
        this.logger.print(error);
        this._toastService.showToast(this.locale.get('toast-registering-failed-text'), this.locale.get('toast-registering-failed-action-text'));
      });
    } else { // if data processor wants to register
      const form = this.formGroupProcessorRegistration;
      this.registerService.registerDataProcessor(form.value['username'] as String, this._sanitizeFormValues(form.value, true)).then((res) => {
        this._toastService.showToast(this.locale.get('toast-registered-successfully-text'), this.locale.get('toast-registered-successfully-action-text'));
        this.logger.print('Redirecting to login page...');
        this.router.navigateByUrl('/login/processor').catch(error => this.logger.print(error));
      }).catch((error) => {
        this.logger.print(error);
        this._toastService.showToast(this.locale.get('toast-registering-failed-text'), this.locale.get('toast-registering-failed-action-text'));
      });
    }
  }

  private _sanitizeFormValues(rawFormGroupValue: Object, isDataProcessor: boolean = false) {
    if (!isDataProcessor) {
      let data: Object = {
        // passwords form group
        password: EncryptService.encryptSHA512(rawFormGroupValue['passwords']['password']),
        // personal from group
        firstname: rawFormGroupValue['personal']['firstname'],
        lastname: rawFormGroupValue['personal']['lastname'],
        birthday: rawFormGroupValue['personal']['birthday'],
        gender: rawFormGroupValue['personal']['gender'],
        // account from group
        email: rawFormGroupValue['account']['email'],
        username: rawFormGroupValue['account']['username'],
        // location form group
        postal: rawFormGroupValue['location']['postal'],
        street: rawFormGroupValue['location']['street'],
        city: rawFormGroupValue['location']['city'],
        country: rawFormGroupValue['location']['country'],
      };
      if (this.formGroupUserRegistration.get('registerAnonymously').value) {
        data = this._anonymizeFormValues(data);
      }
      return data;
    } else { // if sanitizing the input for a potential data processor
      const data: Object = {
        password: EncryptService.encryptSHA512(rawFormGroupValue['passwords']['password'])
      };
      return data;
    }
  }

  private _anonymizeFormValues(data: Object): Object {
    return Object.assign(data, {
      firstname: 'anon',
      lastname: 'anon',
      birthday: 'anon',
      street: 'anon',
      postal: 'anon',
      city: 'anon',
      email: 'anon',
      gender: 'anon',
      country: 'anon'
    });
}

  private _initFormGroupUserRegistration(): void {
    const validators = {};
    for (const key in requiredFieldsUsers) {
      if (requiredFieldsUsers[key]) {
        validators[key] = Validators.required;
      } else {
        validators[key] = null;
      }
    }
    this.formGroupUserRegistration = new FormGroup({
      registerAnonymously: new FormControl(false),
      personal: new FormGroup({
        firstname: new FormControl(null, validators['firstname']),
        lastname: new FormControl(null, validators['lastname']),
        birthday: new FormControl(null, validators['birthday']),
        gender: new FormControl(null, validators['gender'])
      }),
      account: new FormGroup({
        email: new FormControl(null, validators['email']),
        username: new FormControl(null, validators['username'])
      }),
      location: new FormGroup({
        postal: new FormControl(null, validators['postal']),
        street: new FormControl(null, validators['street']),
        city: new FormControl(null, validators['city']),
        country: new FormControl(null, validators['country']),
      }),
      passwords: new FormGroup({
        password: new FormControl(null, validators['password']),
        confirmation: new FormControl(null, validators['password'])
      }, this._checkIfPasswordsMatch.bind(this))
    });
  }

  private _initFormGroupProcessorRegistration(): void {
    this.formGroupProcessorRegistration = new FormGroup({
      username: new FormControl(null, Validators.required),
      passwords: new FormGroup({
        password: new FormControl(null, Validators.required),
        confirmation: new FormControl(null, Validators.required)
      }, this._checkIfPasswordsMatch.bind(this))
    });
  }

  private _checkIfPasswordsMatch(group: FormGroup): ValidationErrors | null {
    const passwordField = group.get('password');
    const confirmationField = group.get('confirmation');
    if (!confirmationField.pristine) {
      let passwordsMatch = true;
      if (passwordField.value !== confirmationField.value) {
        passwordField.setErrors({noMatch: true});
        confirmationField.setErrors({noMatch: true});
        passwordsMatch = false;
        this._submittedToForceValidation = true;
        // this.formGroupUserRegistration.submit
      } else {
        passwordField.setErrors(null);
        confirmationField.setErrors(null);
        passwordsMatch = true;
      }
      return !passwordsMatch ? {noMatch: true} : null;
    }
    return null;
  }

  /**
   * inspired by https://stackoverflow.com/a/53276815/7618184
   */
  public changedAnonymousSlider(): void {
    this.registerAnonymously = this.formGroupUserRegistration.get('registerAnonymously').value;
    const formRoot = this.formGroupUserRegistration;
    const formGroupsToCheck: string[] = ['personal', 'location', 'passwords', 'account'];
    if (this.registerAnonymously) {
      for (const formGroup of formGroupsToCheck) {
        const formGroupControls = formRoot.get(formGroup)['controls'];
        for (const controlName in formGroupControls) {
          if (requiredFieldsAnonUsers[controlName]) {
            formGroupControls[controlName].setValidators(Validators.required);
          } else {
            formGroupControls[controlName].clearValidators();
          }
          formGroupControls[controlName].updateValueAndValidity();
        }
      }
    } else {
      for (const formGroup of formGroupsToCheck) {
        const formGroupControls = formRoot.get(formGroup)['controls'];
        for (const controlName in formGroupControls) {
          if (requiredFieldsUsers[controlName]) {
            formGroupControls[controlName].setValidators(Validators.required);
          } else {
            formGroupControls[controlName].clearValidators();
          }
          formGroupControls[controlName].updateValueAndValidity();
        }
      }
    }
  }
}
