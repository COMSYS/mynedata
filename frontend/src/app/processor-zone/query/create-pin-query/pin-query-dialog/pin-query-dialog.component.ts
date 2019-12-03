import {Component, Inject, OnInit} from '@angular/core';
import {LocalizationService} from '../../../../core/services/localization.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {PinQueryInfoApiResponseModel} from '../../../../../models/api-response/pin-query-info.api-response.model';
import {RequestsService} from '../../../../core/services/requests.service';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-pin-query-dialog',
  templateUrl: './pin-query-dialog.component.html',
  styleUrls: ['./pin-query-dialog.component.css']
})
export class PinQueryDialogComponent implements OnInit {

  constructor(
    private _locale: LocalizationService,
    @Inject(MAT_DIALOG_DATA) private data: {pin: number},
    private _reqServ: RequestsService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public printPin(): string {
    return String(this.data.pin);
  }
}
