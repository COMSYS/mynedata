import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BreadcrumbsService} from '../core/services/breadcrumbs.service';
import {LocalizationService} from '../core/services/localization.service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {FirstTimeWizardComponent} from './first-time-wizard/first-time-wizard.component';
import {AddNewDatasourceComponent} from './add-new-datasource/add-new-datasource.component';
import {SessionService} from '../core/services/session.service';
import {Subscription} from 'rxjs';
import {WizardService} from './services/wizard.service';

@Component({
  selector: 'app-user-zone',
  templateUrl: './user-zone.component.html',
  styleUrls: ['./user-zone.component.css']
})
export class UserZoneComponent implements OnInit, OnDestroy {
  private _refWizardDialog: MatDialogRef<FirstTimeWizardComponent>;
  private _wizardAfterOpenSubscription: Subscription;

  constructor(
      private _router: Router,
      private _breadcrumbs: BreadcrumbsService,
      public locale: LocalizationService,
      private _wizardDialog: MatDialog,
      private _wizServ: WizardService
  ) {
    this._breadcrumbs.setRoot({
      path: this.locale.get('breadcrumbs-user-zone-root-text'),
      link: 'dashboard'
    });
  }

  public ngOnInit(): void {
    // the setTimeout is to prevent a `ExpressionChangedAfterItHasBeenCheckedError` error
    setTimeout(async () => {
      if (!(await this._wizServ.hasDoneWizard())) {
        this._openIntroductionWizardDialog();
      }
    });
  }

  public ngOnDestroy(): void {
    if (this._wizardAfterOpenSubscription) {
      this._wizardAfterOpenSubscription.unsubscribe();
    }
  }

  private _openIntroductionWizardDialog(data?: Object): void {
    const _emitter = new EventEmitter<void>();
    this._refWizardDialog = this._wizardDialog.open(FirstTimeWizardComponent, {
      data: {
        passedData: data,
        afterOpenEmitter: _emitter
      },
      disableClose: true,
      autoFocus: false,
      height: '97%',
      minWidth: 900
    });
    this._wizardAfterOpenSubscription = this._refWizardDialog.afterOpen().subscribe(() => {
      _emitter.emit();
    });
  }

}
