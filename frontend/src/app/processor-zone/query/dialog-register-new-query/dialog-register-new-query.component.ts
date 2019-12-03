import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {RegisteredPinQueryApiResponseModel} from '../../../../models/api-response/registered-pin-query.api-response.model';

@Component({
  selector: 'app-dialog-register-new-query',
  templateUrl: './dialog-register-new-query.component.html',
  styleUrls: ['./dialog-register-new-query.component.css']
})
export class DialogRegisterNewQueryComponent implements OnInit {

  constructor(
    private _dialogRef: MatDialogRef<DialogRegisterNewQueryComponent>,
  ) { }

  ngOnInit() {
  }

  public registeredQuery(): void {
    this._dialogRef.close();
  }

  public registeredPinQuery(response: RegisteredPinQueryApiResponseModel): void {
    this._dialogRef.close();
  }

}
