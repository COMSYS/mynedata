import { Injectable } from '@angular/core';
import {HttpRequestService} from '../../core/services/http-request.service';

export interface RegisterUserData {
}

@Injectable({
    providedIn: 'root'
})
export class CreateAccountService {

  constructor(private httpRequestService: HttpRequestService) { }

  async registerUser(username: String, data: RegisterUserData): Promise<String> {
    return this.httpRequestService.post(`/user/${username}/register`, data);
  }

  async registerDataProcessor(username: String, data: RegisterUserData): Promise<void> {
    return this.httpRequestService.post(`/processor/${username}/register`, data);
  }
}
