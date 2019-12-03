import {Injectable, OnDestroy} from '@angular/core';
import {RequestIssuerType, RequestIssuerTypes, requestIssuerTypesConfig} from '../../../config/requests-issuer-types.config';
import {RegisteredIssuersMock} from '../../../mocks/registered-issuers.mock';
import {RegisteredIssuerApiResponseModel} from '../../../models/api-response/registered-issuer.api-response.model';
import {LoggerService} from './logger.service';


@Injectable({
  providedIn: 'root'
})
export class RequestIssuerService implements OnDestroy {

  constructor(
    private _logger: LoggerService
  ) { }

  ngOnDestroy(): void {
    this._logger = undefined;
  }

  public getRequestIssuerTypes(): RequestIssuerType[] {
    return requestIssuerTypesConfig;
  }

  private _getRequestIssuers(): Promise<RegisteredIssuerApiResponseModel[]> {
    return Promise.resolve(RegisteredIssuersMock);
  }

  public getRequestIssuerTypeById(id: RequestIssuerTypes) {
    const allIssuerTypes = this.getRequestIssuerTypes();
    for (const type of allIssuerTypes) {
      if (type.id === id) {
        return type;
      }
    }
    this._logger.print('Couldnt find request issuer type with id: ', id);
  }

  public getRequestIssuers(): Promise<RegisteredIssuerApiResponseModel[]> {
    return this._getRequestIssuers();
  }

  private async _getIssuerById(id: number): Promise<RegisteredIssuerApiResponseModel> {
    for (const issuer of await this._getRequestIssuers()) {
      if (issuer.id === id) {
        return Promise.resolve(issuer);
      }
    }
    const noIssuer: RegisteredIssuerApiResponseModel = {
      id: id,
      name: "Noname",
      industryBranch: RequestIssuerTypes.SCIENCE,
      locatedIn: {
        cityName: "Aachen",
      }
    };
    return Promise.resolve(noIssuer);
  }

  public getIssuerById(id: number): Promise<RegisteredIssuerApiResponseModel> {
    return this._getIssuerById(id);
  }
}
