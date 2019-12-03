import { Injectable } from '@angular/core';
import {HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _token: string;

  constructor() { }

  get token(): string {
      return this._token;
  }

  set token(value: string) {
      this._token = value;
  }

  /**
   * This function add the token to the headers if a token exists yet (usually not for log in or register
   * @param headers
   */
  public addTokenToHeaders(headers: HttpHeaders): HttpHeaders {
    if (this._token) {
      return headers.append('mynedata-token', this._token);
    }
    return headers;
  }
}
