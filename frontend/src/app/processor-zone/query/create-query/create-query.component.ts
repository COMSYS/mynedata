import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {RequestsService} from '../../../core/services/requests.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {RegisterQueryApiRequestModel} from '../../../../models/api-request/register-query.api-request.model';
import {MatDatepicker} from '@angular/material';
import * as moment from 'moment';
import {LocalizationService} from '../../../core/services/localization.service';
import {ToastService} from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-query',
  templateUrl: './create-query.component.html',
  styleUrls: ['./create-query.component.css']
})
export class CreateQueryComponent implements OnInit {
  @Output() registered = new EventEmitter<void>();

  public formCreateQuery: FormGroup;

  constructor(
    private _reqServ: RequestsService,
    private _locale: LocalizationService,
    private _toast: ToastService
  ) {
    this._initForm();
  }

  ngOnInit() {
  }

  private _initForm(): void {
    this.formCreateQuery = new FormGroup({
      title: new FormControl(null, Validators.required),
      queryString: new FormControl('SELECT SUM(RandomData.random_two) WHERE PersonalInformation.city = anon', Validators.required),
      reward: new FormControl(0, Validators.required),
      intervalTime: new FormGroup({
        start: new FormControl(null, Validators.required),
        end: new FormControl(null, Validators.required)
      }),
      consentTime: new FormGroup({
        start: new FormControl(null, Validators.required),
        end: new FormControl(null, Validators.required)
      }),
      minAmountOfParticipatingUsers: new FormControl(0, Validators.required),
      granularity: new FormControl(Number.MAX_SAFE_INTEGER, Validators.required),
      maximumPrivacy: new FormControl(4, Validators.required),
      logoUrl: new FormControl(''),
      description: new FormControl(null, Validators.required),
      goalDescription: new FormControl('')
    });
  }

  public sendForm(): void {
    this._registerQuery();
  }

  private _registerQuery(): void {
    const q = this.formCreateQuery.value;
    const payload: RegisterQueryApiRequestModel = {
      query: q.queryString,
      price: Number(q.reward),
      interval_start_time: Number(q.intervalTime.start),
      interval_finish_time: Number(q.intervalTime.end),
      consent_start_time: Number(q.consentTime.start),
      consent_finish_time: Number(q.consentTime.end),
      amount: Number(q.minAmountOfParticipatingUsers),
      granularity: Number(q.granularity),
      max_privacy: Number(q.maximumPrivacy),
      thumbnail_url: q.logoUrl === '' ? undefined : q.logoUrl, // if url is empty string, then set to `undefined` such that this field will not be added to the request body (which would break the backend)
      title: q.title,
      description: q.description,
      goal_description: q.goalDescription === '' ? undefined : q.goalDescription // if goal description is empty string, then set to `undefined` such that this field will not be added to the request body (which would break the backend)
    };
    this._reqServ.registerQuery(payload).then(() => {
      this._toast.showToast(this._locale.get('register-query-confirmation-query-registered'));
      this.registered.emit();
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

  public getToday(): Date {
    return moment(new Date()).startOf('month').toDate();
  }

  public print(id: string): string {
    return this._locale.get(id);
  }
}
