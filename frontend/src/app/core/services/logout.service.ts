import {Injectable, OnDestroy} from '@angular/core';
import {HttpRequestService} from './http-request.service';
import {UserRole} from '../../../config/user-roles.config';
import {DatasourceService} from '../../user-zone/services/datasource.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService implements OnDestroy {

    constructor(
      private httpRequestService: HttpRequestService
    ) { }

    ngOnDestroy(): void {
      this.httpRequestService = undefined;
    }

  async logout(username: String, data: Object, role: UserRole = UserRole.ENDUSER): Promise<Object> {
      if (!data['token']) {
        return Promise.reject('no token provided');
      }
      if (role === UserRole.ENDUSER) {
        return this.httpRequestService.post(`/user/${username}/logout`, data);
      } else {
        return this.httpRequestService.post(`/processor/${username}/logout`, data);
      }
    }
}
