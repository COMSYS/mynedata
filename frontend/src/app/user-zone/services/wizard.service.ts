import {Injectable, OnDestroy} from '@angular/core';
import {HttpRequestService} from '../../core/services/http-request.service';
import {promise} from 'selenium-webdriver';
import {SessionService} from '../../core/services/session.service';

@Injectable({
  providedIn: 'root'
})
export class WizardService implements OnDestroy {

  constructor(
    private _ajax: HttpRequestService,
    private _session: SessionService
  ) { }

  ngOnDestroy(): void {
    this._ajax = undefined;
    this._session = undefined;
  }

  public hasDoneWizard(): Promise<boolean> {
    return this._ajax.get(`/user/${this._session.getUsername()}/wizard`);
  }

  public setWizardAsDone(): Promise<any> {
    return this._ajax.post(`/user/${this._session.getUsername()}/wizard`, null);
  }
}
