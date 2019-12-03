import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, NgForm, ValidationErrors, Validator, Validators} from '@angular/forms';
import {LoggerService} from '../core/services/logger.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {EncryptService} from '../core/services/encrypt.service';
import {LocalizationService} from '../core/services/localization.service';
import {environment as env} from '../../environments/environment';
import {root} from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-privacyProtection',
  templateUrl: './privacyProtection.component.html',
  styleUrls: ['./privacyProtection.component.css']
})
export class PrivacyProtectionComponent implements OnInit, AfterViewInit {
  errors: { [key: string]: string } = {};


  constructor(private logger: LoggerService,
              private router: Router,
              public snackbar: MatSnackBar,
              public locale: LocalizationService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  updateErrorMessages() {
  }

  onFormChange(): void {
  }
}
