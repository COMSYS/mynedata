import { Injectable } from '@angular/core';
import {HttpRequestService} from '../../core/services/http-request.service';
import {promise} from 'selenium-webdriver';
import {SidebarComponent} from '../../core/sidebar/sidebar.component';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

    constructor(
      private httpRequestService: HttpRequestService,
    ) { }

    async loginUser(username: string, data: Object): Promise<any> {
      return this.httpRequestService.post(`/user/${username}/login`, data);
    }

    async loginProcessor(username: string, data: Object): Promise<any> {
      return this.httpRequestService.post(`/processor/${username}/login`, data);
    }
}
