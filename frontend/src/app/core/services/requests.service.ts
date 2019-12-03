import {Injectable, OnDestroy} from '@angular/core';
import {RequestStateEnum, UserConsentStateEnum} from '../../../config/requests.config';
import {LoggerService} from './logger.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {RequestInternalRepresentationModel} from '../../../models/internal-representation/request.internal-representation.model';
import {RequestApiResponseModel} from '../../../models/api-response/request.api-response.model';
import {SessionService} from './session.service';
import {RegisterQueryApiRequestModel} from '../../../models/api-request/register-query.api-request.model';
import {HttpRequestService} from './http-request.service';
import {RegisterPinQueryApiRequestModel} from '../../../models/api-request/register-pin-query.api-request.model';
import {PinQueryInfoApiResponseModel} from '../../../models/api-response/pin-query-info.api-response.model';
import {SetConsentStatePinQueryApiRequestModel} from '../../../models/api-request/set-consent-state-pin-query.api-request.model';
import {UserRole} from '../../../config/user-roles.config';


@Injectable({
  providedIn: 'root'
})
export class RequestsService implements OnDestroy {
  private _numberOfPendingRequestsBehaviorSubject: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  constructor(
    private _logger: LoggerService,
    private _session: SessionService,
    private _ajax: HttpRequestService
  ) {
    this.__constructor();
  }

  ngOnDestroy(): void {
    this._logger = undefined;
    this._session = undefined;
    this._ajax = undefined;
    this._numberOfPendingRequestsBehaviorSubject = undefined;
  }

  private async __constructor(): Promise<void> {
    this._initSubjects();
  }

  private async _getAvailableRequests(): Promise<RequestInternalRepresentationModel[]> { // PENDING ALSO (this is redundant)
    const requests: RequestInternalRepresentationModel[] = [];
    const pendingQueries = this.getUserPendingQueries();
    for (const q of await pendingQueries) {
      requests.push(await this._getRequestById(q.query_id));
    }
    return Promise.resolve(requests);
  }

  private async _initSubjects(): Promise<void> {
    if (this._session.isLoggedInAs(UserRole.ENDUSER)) {
      this._numberOfPendingRequestsBehaviorSubject.next(await this.getNumberOfPendingRequests());
    }
  }

  public getAvailableRequests(): Promise<RequestInternalRepresentationModel[]> {
    return this._getAvailableRequests();
  }

  private async _getCompletedRequests(): Promise<RequestInternalRepresentationModel[]> { // ACCEPTED
    const requests: RequestInternalRepresentationModel[] = [];
    const ret = this.getUserAcceptedQueries();
    const internal: RequestInternalRepresentationModel[] = this._convertRequestsFromApiFormatToInternalModel(await ret);
    for (const req of internal) {
    	requests.push(req);
    }
    return Promise.resolve(requests);
  }

  public getCompletedRequests(): Promise<RequestInternalRepresentationModel[]> {
    return this._getCompletedRequests();
  }

  private async _getDeclinedRequests(): Promise<RequestInternalRepresentationModel[]> { // DECLINED
    const requests: RequestInternalRepresentationModel[] = [];
    const ret = this.getUserDeclinedQueries();
    const internal: RequestInternalRepresentationModel[] = this._convertRequestsFromApiFormatToInternalModel(await ret);
    for (const req of internal) {
    	requests.push(req);
    }
    return Promise.resolve(requests);
  }

  public getDeclinedRequests(): Promise<RequestInternalRepresentationModel[]> {
    return this._getDeclinedRequests();
  }

  private async _setRequestStateById(requestId: number, newState: RequestStateEnum): Promise<void> {
    (await this._getRequestById(requestId)).requestState = newState;
    return Promise.resolve();
  }

  private _setRequestState(requestObject: RequestInternalRepresentationModel, newState: RequestStateEnum): Promise<any> {
    requestObject.requestState = newState;
    return Promise.resolve();
  }

  private async _getRequestById(id: number): Promise<RequestInternalRepresentationModel> {
    const req = await this._ajax.get(`/user/${this._session.getUsername()}/query/${id}`);
    return this._convertRequestFromApiFormatToInternalModel(await req);
  }

  public getRequestById(id: number): Promise<RequestInternalRepresentationModel> {
    return this._getRequestById(id);
  }

  public async acceptRequest(requestObject: RequestInternalRepresentationModel): Promise<any> {
    await this._setRequestState(requestObject, RequestStateEnum.ACTIVE);
    await this._updateNumberOfPendingRequestsStream();
    const query_id = {
      query_id: requestObject.requestId,
      proc_id: requestObject.processorId
    };
    return this._ajax.patch(`/user/${this._session.getUsername()}/query/accepted`, query_id);
  }

  public async declineRequest(requestObject: RequestInternalRepresentationModel): Promise<any> {
    await this._setRequestState(requestObject, RequestStateEnum.DECLINED);
    await this._updateNumberOfPendingRequestsStream();
    const query_id = {
      query_id: requestObject.requestId,
      proc_id: requestObject.processorId
    };
    return this._ajax.patch(`/user/${this._session.getUsername()}/query/refused`, query_id);
  }

  public async getNumberOfPendingRequests(): Promise<number> {
    return (await this._getAvailableRequests()).length;
  }

  public async hasPendingRequests(): Promise<boolean> {
    return (await this.getNumberOfPendingRequests()) > 0;
  }

  public getNumberOfPendingRequests$(forceReevalOfNumber: boolean = false): Observable<number> {
    if (forceReevalOfNumber) {
      this._updateNumberOfPendingRequestsStream();
    }
    return this._numberOfPendingRequestsBehaviorSubject.asObservable();
  }

  private async _updateNumberOfPendingRequestsStream(): Promise<void> {
    this._numberOfPendingRequestsBehaviorSubject.next(await this.getNumberOfPendingRequests());
    return Promise.resolve();
  }

  private _convertRequestsFromApiFormatToInternalModel(requests: RequestApiResponseModel[]): RequestInternalRepresentationModel[] {
    const result: RequestInternalRepresentationModel[] = [];
    for (const request of requests) {
      result.push({
        processorId: request.proc_id,
        requestId: request.query_id,
        title: request.title,
        targetedData: null,
        goalDescription: request.goal_description,
        reward: request.price,
        description: request.description,
        requestState: this._convertRequestStateStringToEnum(request.query_state),
        consentState: this._convertConsentStateStringToEnum(request.consent_state),
        intervalTime: {
          start: request.interval_start_time,
          end: request.interval_finish_time
        },
        consentTime: {
          start: request.consent_start_time,
          end: request.consent_finish_time
        },
        granularity: request.granularity,
        amount: request.amount,
        maxPrivacy: request.max_privacy,
        thumbnailUrl: request.thumbnail_url
      });
    }
    return result;
  }

  private _convertRequestFromApiFormatToInternalModel(request: RequestApiResponseModel): RequestInternalRepresentationModel {
    return this._convertRequestsFromApiFormatToInternalModel([request])[0];
  }

  private _convertConsentStateStringToEnum(state: string): UserConsentStateEnum {
    switch (state) {
      case 'pending':
        return UserConsentStateEnum.IS_PENDING;
      case 'accepted':
        return UserConsentStateEnum.ACCPETED;
      case 'refused':
        return UserConsentStateEnum.REFUSED;
      case undefined:
        return undefined;
      default:
        throw new Error(`Can't convert to UserConsentState: state '${state}' is unknown`);
    }
  }

  private _convertConsentStateEnumToString(state: UserConsentStateEnum): string {
    switch (state) {
      case UserConsentStateEnum.ACCPETED:
        return 'accepted';
      case UserConsentStateEnum.REFUSED:
        return 'refused';
      case UserConsentStateEnum.IS_PENDING:
        return 'pending';
      case undefined:
        return undefined;
      default:
        throw new Error(`Can't convert UserConsentState to string: no. '${state}' is unknown`);
    }
  }

  private _convertRequestStateStringToEnum(state: string): RequestStateEnum {
    switch (state) {
      case 'pending':
        return RequestStateEnum.PENDING;
      case 'aborted':
        return RequestStateEnum.ABORTED;
      case 'completed':
        return RequestStateEnum.COMPLETED;
      case 'paid':
        return RequestStateEnum.PAID;
      case undefined:
        return undefined;
      default:
        throw new Error(`Can't convert to RequestState: state '${state}' is unknown`);
    }
  }

  private _convertRequestStateEnumToString(state: RequestStateEnum): string {
    switch (state) {
      case RequestStateEnum.PENDING:
        return 'pending';
      case RequestStateEnum.COMPLETED:
        return 'completed';
      case RequestStateEnum.ABORTED:
        return 'aborted';
      case undefined:
        return undefined;
      default:
        throw new Error(`Can't convert RequestState to string: no. '${state}' is unknown`);
    }
  }

  public createRequest(request: RegisterQueryApiRequestModel): Promise<any> {
    return this._ajax.post(`/processor/${this._session.getUsername()}/query`, request);
  }

  public registerQuery(query: RegisterQueryApiRequestModel): Promise<any> {
    return this.createRequest(query);
  }

  public createPinRequest(request: RegisterPinQueryApiRequestModel): Promise<any> {
    return this._ajax.post(`/processor/${this._session.getUsername()}/pin_query`, request);
  }

  public registerPinQuery(query: RegisterPinQueryApiRequestModel): Promise<any> {
    return this.createPinRequest(query);
  }

  public getPinQueryInfo(pin: number): Promise<PinQueryInfoApiResponseModel> {
    return this._ajax.get(`/user/${this._session.getUsername()}/pin_query_info/${pin}`);
  }

  public acceptPinRequest(pin: number): Promise<any> {
    const body: SetConsentStatePinQueryApiRequestModel = {
      accept: 'true'
    };
    return this._ajax.post(`/user/${this._session.getUsername()}/pin_query_response/${pin}`, body);
  }

  public declinePinRequest(pin: number): Promise<any> {
    const body: SetConsentStatePinQueryApiRequestModel = {
      accept: ''
    };
    return this._ajax.post(`/user/${this._session.getUsername()}/pin_query_response/${pin}`, body);
  }

  public getProcessorPendingQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/query/pending`);
  }

  public getProcessorCompletedQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/query/completed`);
  }

  public getProcessorAbortedQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/query/aborted`);
  }

  public getProcessorPaidQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/query/paid`);
  }

  public getProcessorPendingPinQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/pin_query/pending`);
  }

  public getProcessorCompletedPinQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/pin_query/completed`);
  }

  public getProcessorAbortedPinQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/pin_query/aborted`);
  }

  public getQueryInfo(id: number): Promise<RequestApiResponseModel> {
    return this._ajax.get(`/processor/${this._session.getUsername()}/query_info/${id}`);
  }

  public getUserPendingQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/user/${this._session.getUsername()}/query/pending`);
  }

  public getUserAcceptedQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/user/${this._session.getUsername()}/query/accepted`);
  }

  public getUserDeclinedQueries(): Promise<RequestApiResponseModel[]> {
    return this._ajax.get(`/user/${this._session.getUsername()}/query/refused`);
  }

  public __dev_debugComputeAdhoc(queryId: number): Promise<any> {
    return this._ajax.__dev_debugComputeAdhoc(this._session.getUsername(), queryId);
  }
}
