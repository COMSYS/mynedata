import {Injectable, OnDestroy} from '@angular/core';
import {privacyConfig} from '../../../config/privacy.config';
import {DataTypes} from '../../../config/data-types.config';
import {DataTypesService} from '../../core/services/data-types.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {HttpRequestService} from '../../core/services/http-request.service';
import {SessionService} from '../../core/services/session.service';
import {Data} from '@angular/router';
import {LocalizationService} from '../../core/services/localization.service';
import {DefaultPrivacyApiResponseModel} from '../../../models/api-response/default-privacy.api-response.model';
import {LoggerService} from '../../core/services/logger.service';
import {isEmpty} from 'rxjs/operators';
import {promise} from 'selenium-webdriver';
import {UpdatePrivacyDatatypesApiRequestModel} from '../../../models/api-request/update-privacy-datatypes.api-request.model';
import {RequestIssuerType, RequestIssuerTypes} from '../../../config/requests-issuer-types.config';
import {RequestIssuerPermissionsMock} from '../../../mocks/request-issuer-permissions.mock';
import {isNull, isUndefined} from 'util';
import {_def} from '@angular/core/src/view/provider';
import {DefaultPrivacyInternalRepresentationModel} from '../../../models/internal-representation/default-privacy.internal-representation.model';

@Injectable({
  providedIn: 'root'
})
export class PrivacyService implements OnDestroy {
  private _globalPrivacy: number;
  private _minimalPrivacy: number;
  private _maximumPrivacy: number;

  private _globalPrivacyBehaviorSubject: BehaviorSubject<number> = new BehaviorSubject(privacyConfig.min);

  private _fetchedDatatypesDefaultPrivacies: Promise<DefaultPrivacyInternalRepresentationModel>;
  private _fetchedRequestIssuersDefaultPrivacies: {[key: number]: boolean};
  private _explicitlyAuthorizeDataUsage: boolean;
  private _explicitlyAuthorizeDataUsageSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(Boolean(this._explicitlyAuthorizeDataUsage));

  // object that holds all (Behavior-)Subjects for request issuers that have yet been requested to be watched
  private _requestIssuersBehaviorSubjects: {[key: string]: BehaviorSubject<boolean>} = {};

  // object that holds all (Behavior-)Subjects for data types that have yet been requested to be watched
  private _dataTypesBehaviorSubjects: {[key: string]: BehaviorSubject<number>} = {};


  constructor(
    private _datatypes: DataTypesService,
    private _ajax: HttpRequestService,
    private _session: SessionService,
    private _locale: LocalizationService,
    private _logger: LoggerService
  ) {
    this._globalPrivacy = 1;
    this.fetchDefaultPrivaciesFromAPI();
    this._minimalPrivacy = privacyConfig.min;
    this._maximumPrivacy = privacyConfig.max;
  }

  ngOnDestroy(): void {
    this._globalPrivacy = undefined;
    this._maximumPrivacy = undefined;
    this._minimalPrivacy = undefined;
    this._globalPrivacyBehaviorSubject = undefined;
    this._fetchedDatatypesDefaultPrivacies = undefined;
    this._fetchedRequestIssuersDefaultPrivacies = undefined;
    this._explicitlyAuthorizeDataUsage = undefined;
    this._explicitlyAuthorizeDataUsageSubject = undefined;
    this._requestIssuersBehaviorSubjects = undefined;
    this._dataTypesBehaviorSubjects = undefined;
    this._datatypes = undefined;
    this._ajax = undefined;
    this._session = undefined;
    this._locale = undefined;
    this._logger = undefined;
  }

  public setGlobalPrivacy(privacy: number): void {
    if (privacy !== this._globalPrivacy) {
      this._globalPrivacy = privacy;
      // only push the new privacy to subscribers if it has changed, of course. otherwise the subscribers'll get reset
      this._globalPrivacyBehaviorSubject.next(privacy);

      // divided by 2 since the numeric value AND the string interpretation are both keys, thus get counted twice
      const numberOfDataTypes = Object.keys(DataTypes).length / 2;
      const privacy_levels: Array<Object> = [];
      for (let i = 0; i < numberOfDataTypes; i++) {
        privacy_levels.push({label: i, level: privacy});
        this.setDatatypePrivacy(i, privacy);
      }

      this._ajax.patch(`/user/${this._session.getUsername()}/default_privacy`, { privacy_levels: privacy_levels});
    }
  }

  public getGlobalPrivacy(): number {
      return this._globalPrivacy;
  }

  public getMaxPrivacy(): number {
    return this._maximumPrivacy;
  }

  public getMinPrivacy(): number {
    return this._minimalPrivacy;
  }

  public async setDatatypePrivacy(id: DataTypes, privacy: number): Promise<void> {
    // since the labels in the database are enumerated from 1 to 10, now a shift up by one is necessary
    const privacyObj: {privacy_levels: DefaultPrivacyApiResponseModel[]} = {
      privacy_levels: [
        {
          label: id + 1,
          level: privacy
        }
      ]
    };
    this._ajax.patch(`/user/${this._session.getUsername()}/default_privacy`, privacyObj);

    if ((await this._fetchedDatatypesDefaultPrivacies).hasOwnProperty(id)) {
      (await this._fetchedDatatypesDefaultPrivacies)[id] = privacy;
    }
    this._shoutOutDataTypePrivacy(id, privacy);
  }

  public async setDatatypesPrivacies(vals: DefaultPrivacyInternalRepresentationModel): Promise<any> {
    const _ajaxBodyObject: UpdatePrivacyDatatypesApiRequestModel = {
      privacy_levels: []
    };
    // const newSettings: DefaultPrivacyApiResponseModel[] = [];
    for (const dataTypeId in vals) {
      _ajaxBodyObject.privacy_levels.push({
        level: Number(vals[dataTypeId]),
        label: this._datatypes.getDatatypeLocaleIdentifierById(Number(dataTypeId)).toLowerCase()
      });
      this._shoutOutDataTypePrivacy(Number(dataTypeId), Number(vals[dataTypeId]));
    }
    this._fetchedDatatypesDefaultPrivacies = Promise.resolve(Object.assign(await this._fetchedDatatypesDefaultPrivacies, vals) );
    return this._ajax.patch(`/user/${this._session.getUsername()}/default_privacy`, _ajaxBodyObject);
  }

  public async getDatatypePrivacy(id: DataTypes): Promise<number> {
    if ((await this._fetchedDatatypesDefaultPrivacies).hasOwnProperty(id)) {
      return Promise.resolve((await this._fetchedDatatypesDefaultPrivacies)[id]);
    }
    this._logger.print(`Couldn't get privacy of datatype because datatype ${id} does not exist`);
  }

  private async fetchDefaultPrivaciesFromAPI(): Promise<void> {
    this._fetchedDatatypesDefaultPrivacies = new Promise(async (resolve, reject) => {
      const _fetchedPrivacies: DefaultPrivacyApiResponseModel[] = (await this._ajax.get(`/user/${this._session.getUsername()}/default_privacy`));


      // since the labels in the database are passed as literal strings, so a conversion to the corresponding number is necessary
      for (const privacy of _fetchedPrivacies) {
        privacy.label = this._datatypes.getDataTypeIdByStringLiteral(privacy.label.toString());
      }

      if (_fetchedPrivacies) {
        resolve(this._transformDefaultPrivacies(_fetchedPrivacies));
      } else {
        this._logger.print('Couldn\'t fetch default privacies but promise was not rejected');
        reject();
      }




    });
  }

  public refetchDatatypePrivacies(): Promise<void> {
    return this.fetchDefaultPrivaciesFromAPI();
  }

  public getPrivacySettingAsCssClass(_privacy: number): Object {
    // 0 - black, 1 - red, 2 - green, 3 - green
    // <-- less privacy | more privacy -->

    const _privacyLevel: number = _privacy;
    switch (_privacyLevel) {
      case 0:
        return {
          black: true
        };
      case 1:
        return {
          red: true
        };
      case 2:
        return {
          yellow: true
        };
      case 3:
        return {
          green: true
        };
      default:
        return {
          black: true
        };
    }
  }

  public getPrivacyAsColorTooltip(_privacy): string {
    const _privacyLevel: number = _privacy;
    const _tooltip = this._locale.get('anonymity-traffic-light-tooltip');
    const _placeholderPrivacyLevel = this._locale.get('anonymity-traffic-light-tooltip-placeholder-privacy-level');
    return _tooltip.replace(_placeholderPrivacyLevel, String(_privacyLevel));
  }

  public async isDataTypeEnabled(id: DataTypes): Promise<boolean> {
    return await this.getDatatypePrivacy(id) !== privacyConfig.none;
  }

  public setExplicitAuthorizationOfDataUsage(bool: boolean): void {
    this._explicitlyAuthorizeDataUsageSubject.next(bool);
    this._explicitlyAuthorizeDataUsage = bool;
  }

  public shouldExplicitlyAuthorizeDataUsage(): boolean {
    return Boolean(this._explicitlyAuthorizeDataUsage);
  }

  public shouldExplicitlyAuthorizeDataUsage$(): Observable<boolean> {
    return this._explicitlyAuthorizeDataUsageSubject.asObservable();
  }

  private _getRequestIssuerPermissionObject(): {[key: number]: boolean} {
    if (!this._fetchedRequestIssuersDefaultPrivacies) {
      this._fetchedRequestIssuersDefaultPrivacies = RequestIssuerPermissionsMock;
    }
    return this._fetchedRequestIssuersDefaultPrivacies;
  }

  public getRequestIssuerPermissions(): {[key: number]: boolean} {
    return this._getRequestIssuerPermissionObject();
  }

  public setRequestissuerPermissions(permissions: {[key: number]: boolean}): void {
    Object.assign(this._getRequestIssuerPermissionObject(), permissions);
    for (const id in permissions) {
      this._shoutOutRequestIssuerPermission(Number(id), permissions[id]);
    }
  }

  public async getRequestIssuerPermission(id: RequestIssuerTypes): Promise<boolean> {
    return Promise.resolve(this._getRequestIssuerPermissionObject()[id]);
  }

  public async watchRequestIssuerPermission$(id: RequestIssuerTypes): Promise<Observable<boolean>> {
    if (isNull(this._requestIssuersBehaviorSubjects[id]) || isUndefined(this._requestIssuersBehaviorSubjects[id])) {
      this._requestIssuersBehaviorSubjects[id] = new BehaviorSubject(await this.getRequestIssuerPermission(id));
    }
    return this._requestIssuersBehaviorSubjects[id].asObservable();
  }

  public async watchDataTypePrivacy$(id: DataTypes): Promise<Observable<number>> {
    if (isNull(this._dataTypesBehaviorSubjects[id]) || isUndefined(this._dataTypesBehaviorSubjects[id])) {
      this._dataTypesBehaviorSubjects[id] = new BehaviorSubject(await this.getDatatypePrivacy(id));
    }
    return this._dataTypesBehaviorSubjects[id].asObservable();
  }

  public setRequestissuerPermission(id: RequestIssuerTypes, permission: boolean): void {
    this._getRequestIssuerPermissionObject()[id] = permission;
    this._shoutOutRequestIssuerPermission(id, permission);
  }

  private _shoutOutRequestIssuerPermission(id: RequestIssuerTypes, permission: boolean): void {
    if (!(isNull(this._requestIssuersBehaviorSubjects[id]) || isUndefined(this._requestIssuersBehaviorSubjects[id]))) {
      this._requestIssuersBehaviorSubjects[id].next(permission);
    }
  }

  private _shoutOutDataTypePrivacy(id: DataTypes, privacy: number): void {
    if (!(isNull(this._dataTypesBehaviorSubjects[id]) || isUndefined(this._dataTypesBehaviorSubjects[id]))) {
      this._dataTypesBehaviorSubjects[id].next(privacy);
    }
  }

  public async getDefaultPrivacies(refetchFromApi: boolean = false): Promise<DefaultPrivacyInternalRepresentationModel> {
    /* I think it is not guaranteed that the position in the array always corresponds with the DataTypeId, so I'm just gonna pass the array */
    if (refetchFromApi) {
      await this.refetchDatatypePrivacies();
    }
    return this._fetchedDatatypesDefaultPrivacies;
  }

  private _transformDefaultPrivacies(privacies: DefaultPrivacyApiResponseModel[]): DefaultPrivacyInternalRepresentationModel {
    const _transformed = {};
    for (const entry of privacies) {
      _transformed[entry.label] = entry.level;
    }
    return _transformed;
  }
}
