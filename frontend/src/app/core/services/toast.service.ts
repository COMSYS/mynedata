import {Injectable, OnDestroy} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material';

const toastDefaultSettings: MatSnackBarConfig<any> = {
  duration: 1500,
  verticalPosition: 'top'
};


@Injectable({
  providedIn: 'root'
})
export class ToastService implements OnDestroy {

  constructor(
    private _toast: MatSnackBar
  ) { }

  public showToast<InjectedChildComponentDataType = any>(message: string, action?: string, opts?: MatSnackBarConfig<InjectedChildComponentDataType>): MatSnackBarRef<any> {
    const helper = Object.assign({}, toastDefaultSettings);
    return this._toast.open(message, action, Object.assign(helper, opts));
  }

  ngOnDestroy(): void {
    this._toast = undefined;
  }
}
