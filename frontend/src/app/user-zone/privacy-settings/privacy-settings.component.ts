import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';
import {FormGroup} from '@angular/forms';
import {Subject, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material';
import {DialogWarnSettingPrivaciesComponent} from './dialog-warn-setting-privacies/dialog-warn-setting-privacies.component';

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.css']
})
export class PrivacySettingsComponent implements OnInit, OnDestroy {
  @Output('onSave') onSavedEventEmitter = new EventEmitter<void>();
  @Input('refresh-slider') refreshSlider: EventEmitter<void>;
  @Input() suppressUpdateOnDataTypePrivacyWarning: boolean = false;

  public formGroup = new FormGroup({});
  public fromGroupNameDatatypesPrivacies = 'datatypesPrivacies';

  public uploadTriggerSubject: Subject<void> = new Subject<void>();
  public hasChangedSomething: boolean = false;
  public hasChangedDataTypePrivacies: boolean = false;

  public recheckTickPositionEventEmitter: EventEmitter<void> = new EventEmitter<void>();
  public dataTypesPrivaciesReadyEE = new EventEmitter<void>();

  private _warningDialogSubscription: Subscription;

  constructor(
      private _crumbs: BreadcrumbsService,
      private _locale: LocalizationService,
      private _warningDialog: MatDialog
  ) {
    _crumbs.moveDown({
        link: 'privacy-settings',
        path: _locale.get('privacy-settings-link-text-sidenav')
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._crumbs.moveUp();
    if (this._warningDialogSubscription) {
      this._warningDialogSubscription.unsubscribe();
    }
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public uploadData(): void {
    if (!this.suppressUpdateOnDataTypePrivacyWarning && this.hasChangedDataTypePrivacies) {
      const dialogRef = this._warningDialog.open(DialogWarnSettingPrivaciesComponent);
      this._warningDialogSubscription = dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this._uploadData();
        }
      });
    } else {
      this._uploadData();
    }
  }

  private _uploadData(): void {
    this.uploadTriggerSubject.next();
    this.hasChangedSomething = false;
    this.hasChangedDataTypePrivacies = false;
    this.onSavedEventEmitter.emit();
  }
}
