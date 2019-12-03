import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {FirstTimeWizardComponent} from '../../first-time-wizard/first-time-wizard.component';
import {DetailsPinQueryDialogComponent} from './details-pin-query-dialog/details-pin-query-dialog.component';
import {RequestsService} from '../../../core/services/requests.service';
import {ToastService} from '../../../core/services/toast.service';
import {PinQueryInfoApiResponseModel} from '../../../../models/api-response/pin-query-info.api-response.model';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-dashboard-widget-new-service',
  templateUrl: './dashboard-widget-new-service.component.html',
  styleUrls: ['./dashboard-widget-new-service.component.css', '../dashboard-widgets.css']
})
export class DashboardWidgetNewServiceComponent implements OnInit, OnDestroy {
  public enteredPin: string;
  private _refDetailsDialog: MatDialogRef<DetailsPinQueryDialogComponent>;
  private _detailsDialogAfterClosed: Subscription;

  constructor(
    private _detailsDialog: MatDialog,
    public locale: LocalizationService,
    private _reqServ: RequestsService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this._detailsDialogAfterClosed) {
      this._detailsDialogAfterClosed.unsubscribe();
    }
  }

  public async evaluatePin(): Promise<void> {
    this._reqServ.getPinQueryInfo(Number(this.enteredPin)).then(response => {
      this._showDetails(response);
    }).catch(e => {
      let _toastText = '';
      if (e && e.error && e.error.code) {
        switch (e.error.code) {
          case 19:
            _toastText = this.locale.get('request-new-service-error-pin-unknown');
            break;
          default:
            _toastText = this.locale.get('unknown-error-occured');
        }
      } else {
        _toastText = this.locale.get('unknown-error-occured');
      }
      this._toast.showToast(_toastText);
    });
  }

  private _showDetails(query: PinQueryInfoApiResponseModel) {
    this._openDetailsDialog(query);
  }

  private _openDetailsDialog(data?: Object): void {
    this._refDetailsDialog = this._detailsDialog.open(DetailsPinQueryDialogComponent, {
      data: {
        pinQuery: data,
        pin: this.enteredPin
      },
      disableClose: true
    });

    this._detailsDialogAfterClosed = this._detailsDialog.afterAllClosed.subscribe(() => {
      this.enteredPin = '';
    });
  }

}
