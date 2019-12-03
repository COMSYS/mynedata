import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDatepicker} from '@angular/material';
import * as moment from 'moment';
import {LocalizationService} from '../../../core/services/localization.service';
import {RequestsService} from '../../../core/services/requests.service';
import {ToastService} from '../../../core/services/toast.service';
import {RegisterPinQueryApiRequestModel} from '../../../../models/api-request/register-pin-query.api-request.model';
import {RegisteredPinQueryApiResponseModel} from '../../../../models/api-response/registered-pin-query.api-response.model';
import {MatDialog, MatDialogRef} from '@angular/material';
import {PinQueryDialogComponent} from './pin-query-dialog/pin-query-dialog.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-create-pin-query',
  templateUrl: './create-pin-query.component.html',
  styleUrls: ['./create-pin-query.component.css']
})
export class CreatePinQueryComponent implements OnInit, OnDestroy {
  @Output() registered = new EventEmitter<RegisteredPinQueryApiResponseModel>();

  public formCreatePinQuery: FormGroup;

  private _refPinDialog: MatDialogRef<PinQueryDialogComponent>;
  private _pinDialogAfterClosed: Subscription;

  constructor(
    private _locale: LocalizationService,
    private _pinDialog: MatDialog,
    private _reqServ: RequestsService,
    private _toast: ToastService
  ) {
    this._initForm();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this._pinDialogAfterClosed) {
      this._pinDialogAfterClosed.unsubscribe();
    }
  }

   private _openPinDialog(pin: number): void {
    this._refPinDialog = this._pinDialog.open(PinQueryDialogComponent, {
      data: {
        pin: pin
      }
    });

    this._pinDialogAfterClosed = this._pinDialog.afterAllClosed.subscribe();
  }

  private _initForm(): void {
    this.formCreatePinQuery = new FormGroup({
      queryString: new FormControl('SELECT SUM(RandomData.random_two) WHERE PersonalInformation.city = aachen', Validators.required),
      consentTime: new FormGroup({
        start: new FormControl(null, Validators.required),
        end: new FormControl(null, Validators.required)
      })
    });
  }

  public monthSelected(date: Date, datePicker: MatDatepicker<any>, isPickerForStartOfRange: boolean = true) {
    let _date = moment(date); // if date is null because nothing was selected afore, then it creates a date for today
    if (isPickerForStartOfRange) {
      _date = _date.startOf('month');
    } else {
      _date = _date.endOf('month');
    }
    datePicker._select(_date);
    datePicker.close();
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public getToday(): Date {
    return moment(new Date()).startOf('month').toDate();
  }

  public sendForm(): void {
    this._registerPinQuery();
  }

  private _registerPinQuery(): void {
    const q = this.formCreatePinQuery.value;
    const payload: RegisterPinQueryApiRequestModel = {
      query: q.queryString,
      consent_start_time: Number(q.consentTime.start),
      consent_finish_time: Number(q.consentTime.end)
    };
    this._reqServ.registerPinQuery(payload).then(res => {
      this._openPinDialog(res['response_data']['session_pin']);
      this._toast.showToast(this._locale.get('register-query-confirmation-query-registered'));
      this.registered.emit(res);
    });
  }

}
