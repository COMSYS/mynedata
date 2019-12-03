import { Injectable } from '@angular/core';
import * as sha512 from 'js-sha512';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {

  constructor() { }

  static encryptSHA512(toBeEncrypted: String): string {
    return sha512(toBeEncrypted);
  }
}
