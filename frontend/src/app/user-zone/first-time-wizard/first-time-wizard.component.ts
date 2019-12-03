import {Component, EventEmitter, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SessionService} from '../../core/services/session.service';
import {PrivacyService} from '../services/privacy.service';
import {DataTypes} from '../../../config/data-types.config';
import {MAT_DIALOG_DATA, MatDialogRef, MatStep, MatStepper} from '@angular/material';
import {StepperSelectionEvent} from '@angular/cdk/stepper';
import {Datasource, DatasourceService, DatasourceWrapper} from '../services/datasource.service';
import {LocalizationService} from '../../core/services/localization.service';
import {WizardService} from '../services/wizard.service';

@Component({
  selector: 'app-first-time-wizard',
  templateUrl: './first-time-wizard.component.html',
  styleUrls: ['./first-time-wizard.component.css']
})
export class FirstTimeWizardComponent implements OnInit {
  public wizardAfterOpenEventEmitter: EventEmitter<void>;
  public formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: {passedData: any, afterOpenEmitter: EventEmitter<void>},
    private _session: SessionService,
    private dialogRef: MatDialogRef<FirstTimeWizardComponent>,
    private _locale: LocalizationService,
    private _wizServ: WizardService
  ) {
  }

  ngOnInit() {
    if (this.data) {
      this.wizardAfterOpenEventEmitter = this.data.afterOpenEmitter;
    }
  }

  public print(identifier: string): string {
    return this._locale.get(identifier);
  }

  public skipWizard(): void {
    this.dialogRef.close();
  }

  public closeWizardAfterUsage(): void {
    this._wizServ.setWizardAsDone();
    this.dialogRef.close();
  }
}
