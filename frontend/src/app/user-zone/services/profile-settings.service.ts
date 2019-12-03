import {Injectable, OnDestroy} from '@angular/core';
import {HttpRequestService} from '../../core/services/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileSettingsService implements OnDestroy {

  constructor(private httpRequestService: HttpRequestService) { }

  ngOnDestroy(): void {
    this.httpRequestService = undefined;
  }
}
