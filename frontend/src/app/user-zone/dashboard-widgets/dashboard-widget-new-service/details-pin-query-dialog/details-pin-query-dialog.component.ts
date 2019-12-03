import {Component, Inject, OnInit} from '@angular/core';
import {LocalizationService} from '../../../../core/services/localization.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {PinQueryInfoApiResponseModel} from '../../../../../models/api-response/pin-query-info.api-response.model';
import {RequestsService} from '../../../../core/services/requests.service';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-details-pin-query-dialog',
  templateUrl: './details-pin-query-dialog.component.html',
  styleUrls: ['./details-pin-query-dialog.component.css']
})
export class DetailsPinQueryDialogComponent implements OnInit {

  constructor(
    private _locale: LocalizationService,
    @Inject(MAT_DIALOG_DATA) private data: {pinQuery: PinQueryInfoApiResponseModel, pin: number},
    private _reqServ: RequestsService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
  }

  public isPending(): boolean {
    return true;
  }

  public acceptRequest(): void {
    this._reqServ.acceptPinRequest(this.data.pin).then(() => {
      this._toast.showToast(this._locale.get('request-accepted-toast'));
    });
  }

  public declineRequest(): void {
    this._reqServ.declinePinRequest(this.data.pin).then(() => {
      this._toast.showToast(this._locale.get('request-declined-toast'));
    });
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

  public demoPrintPinQueryInfo(): string {
    return JSON.stringify(this.data.pinQuery, null, 4);
  }
}
