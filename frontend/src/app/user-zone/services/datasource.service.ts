import {Injectable, OnDestroy} from '@angular/core';
import {HistoryItem, HistoryItemType, HistoryService} from '../../core/services/history.service';
import {DataTypes} from '../../../config/data-types.config';
import {PrivacyService} from './privacy.service';
import {LoggerService} from '../../core/services/logger.service';
import {AvailableDatasourceApiResponseModel} from '../../../models/api-response/available-datasource.api-response.model';
import {HttpRequestService} from '../../core/services/http-request.service';
import {SessionService} from '../../core/services/session.service';
import {RegisterDatasourceApiRequestModel} from '../../../models/api-request/register-datasource.api-request.model';
import {EncryptService} from '../../core/services/encrypt.service';
import {RegisteredDatasourceApiResponseModel} from '../../../models/api-response/registered-datasource.api-response.model';
import {DatasourcePrivacyApiResponseModel} from '../../../models/api-response/datasource-privacy.api-response.model';
import {DataTypesService} from '../../core/services/data-types.service';
import {UpdatePrivacyDatasourceApiRequestModel} from '../../../models/api-request/update-privacy-datasource.api-request.model';
import {DATASOURCE_TIME_UNIT, UploadGranularityService} from '../../core/services/upload-granularity.service';
import {RandomDataDatasourceMock} from '../../../mocks/random-data-datasource.mock';
import {DataFromDatasourceApiResponseModel} from '../../../models/api-response/data-from-datasource.api-response.model';
import {AdditionalDatasourcesMock} from '../../../mocks/additional-datasources.mock';

export interface Datasource {
  name: string;
  displayedName?: string;
  frequency: number;
  unitOfTime: DATASOURCE_TIME_UNIT;
  privacy?: DatasourcePrivacyApiResponseModel[];
  datatypes?: DataTypes[];
  accessToken?: string;
  timestamp?: number;
  // remove, when no mocks are used anymore
  mock?: boolean;
}

interface DatasourceId {
  id: number;
}

export type DatasourceWrapper = Datasource & DatasourceId;

@Injectable({
  providedIn: 'root'
})
export class DatasourceService implements OnDestroy {

  public hasAddedArbitraryTestDS = false;

  private _registeredDatasources: Promise<DatasourceWrapper[]>;

  constructor(
      private _history: HistoryService,
      private _privacyService: PrivacyService,
      private _logger: LoggerService,
      private _ajax: HttpRequestService,
      private _session: SessionService,
      private _dataTypesService: DataTypesService
  ) {
    this._fetchRegisteredDatasources();
    this._addArbitraryTestDS();
  }

  ngOnDestroy(): void {
    this.hasAddedArbitraryTestDS = undefined;
    this._registeredDatasources = undefined;
    this._history = undefined;
    this._privacyService = undefined;
    this._logger = undefined;
    this._ajax = undefined;
    this._session = undefined;
    this._dataTypesService = undefined;
  }

  private _addArbitraryTestDS(): void {
    if (!this.hasAddedArbitraryTestDS) {
      for (const mock of AdditionalDatasourcesMock) {
        this._registeredDatasources.then(x => x.push(mock));
      }
    }
    this.hasAddedArbitraryTestDS = true;
  }

  public async registerDatasource(_datasource: DatasourceWrapper, suppressAddingToHistory: boolean = false): Promise<void> {
    const _timestamp = Date.now();
    const _username = this._session.getUsername();
    const _access_token = EncryptService.encryptSHA512(_timestamp + _username + Math.random());
    await this._ajax.post(`/user/${_username}/data_source/${_datasource.id}`, <RegisterDatasourceApiRequestModel>{
      timestamp: Date.now(),
      access_token: _access_token,
      upload_granularity: UploadGranularityService.convertUploadIntervalToMilliseconds(_datasource.frequency, _datasource.unitOfTime),
      privacy_settings: []
    });

    const _histItem: HistoryItem = {
        type: HistoryItemType.DATASOURCE_ADDED ,
        time: new Date(),
        data: _datasource
    };

    if (!suppressAddingToHistory) {
        this._history.addToHistory(_histItem);
    }

    this.hasAddedArbitraryTestDS = false;
    this._fetchRegisteredDatasources();
  }

  private async _getDatasourceById(id: number): Promise<DatasourceWrapper> {
    for (const ds of (await this._registeredDatasources)) {
      if (ds.id === id) {
        return ds;
      }
    }
    // if no such id was found
    this._logger.print(`Wasn't able to find Datasource with id ${id}!`);
    return undefined;
  }

  public getDatasourceById(id: number): Promise<DatasourceWrapper> {
    return this._getDatasourceById(id);
  }

  public getRegisteredDatasources(_refetchFromApi: boolean = false): Promise<DatasourceWrapper[]> {
    if (_refetchFromApi) {
      return this._fetchRegisteredDatasources().then(() => {
        this.hasAddedArbitraryTestDS = false;
        this._addArbitraryTestDS();
        return this._registeredDatasources;
      });
    }
    this._addArbitraryTestDS();
    return this._registeredDatasources;
  }

  public async getAvailableDatasourcesList(): Promise<AvailableDatasourceApiResponseModel[]> {
    const datasources = await this._ajax.get('/data_sources') as AvailableDatasourceApiResponseModel[];
    for (let i = 0; i < datasources.length; i++) {
      datasources[i].displayed_name = datasources[i].data_source_name === 'random_data' ? 'Zufallsdaten' : datasources[i].data_source_name;
      if (await this._isDatasourceAlreadyRegistered(datasources[i].data_source_id)) {
        datasources.splice(i, 1);
        i--;
      }
    }
    return datasources;
  }

  public isDatasourceAlreadyRegistered(id: number): Promise<boolean> {
    return this._isDatasourceAlreadyRegistered(id);
  }

  private async _isDatasourceAlreadyRegistered(id: number): Promise<boolean> {
    for (const ds of (await this._registeredDatasources)) {
      if (ds.id === id) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  private async _fetchRegisteredDatasources(): Promise<void> {
    this._registeredDatasources = new Promise(async (resolve) => {
      const _datasourcesInWrongFormat: RegisteredDatasourceApiResponseModel[] = await this._ajax.get(`/user/${this._session.getUsername()}/data_sources/true`);
      const _datasourcesInCorrectFormat: DatasourceWrapper[] = [];
      for (const ds of _datasourcesInWrongFormat) {
        _datasourcesInCorrectFormat.push(await this._convertResponseDatasourceToInternallyUsedDatasourceWrapper(ds));
      }
      return resolve(_datasourcesInCorrectFormat);
    });
    this._addArbitraryTestDS();
  }

  private async _convertResponseDatasourceToInternallyUsedDatasourceWrapper(_toBeConvertedDatasource: RegisteredDatasourceApiResponseModel): Promise<DatasourceWrapper> {
    const privacySettingsforDatasource: DatasourcePrivacyApiResponseModel[]
      = await this._ajax.get(`/user/${this._session.getUsername()}/data_source/${_toBeConvertedDatasource.data_source_id}/privacy`);
    const dataTypeIds: DataTypes[] = [];
    for (const object of privacySettingsforDatasource) {
      // add to the privacy answer from the API for easy access to id, privacy and ds attribute name
      object.dataTypeId = this._dataTypesService.getDataTypeIdByStringLiteral(object.label);

      // this is to cope with the replacement of the data types with a new set
      if (isNaN(object.dataTypeId)) {
        object.dataTypeId = 3;
      }

      // add this for easily having an array containing the IDs of all the used data types without iterating over the privacy array to collect the IDs
      dataTypeIds.push(object.dataTypeId);
    }

    const _displayedName: string = (_toBeConvertedDatasource.data_source_name === 'random_data') ? 'Zufallsdaten' : _toBeConvertedDatasource.data_source_name;

    const _convertedUploadGranularity = UploadGranularityService.convertMillisecondsToFrequencyAndUnitOfTime(_toBeConvertedDatasource.upload_interval);
    const _convertedDatasource: DatasourceWrapper = {
      id: _toBeConvertedDatasource.data_source_id,
      name: _toBeConvertedDatasource.data_source_name,
      accessToken: _toBeConvertedDatasource.access_token,
      timestamp: _toBeConvertedDatasource.timestamp,
      privacy: privacySettingsforDatasource,
      frequency: _convertedUploadGranularity.frequency,
      unitOfTime: _convertedUploadGranularity.unitOfTime,
      datatypes: dataTypeIds,
      displayedName: _displayedName
    };
    return _convertedDatasource;
  }

  public async deregisterDatasource(id: number): Promise<void> {
    await this._ajax.delete(`/user/${this._session.getUsername()}/data_source/${id}`);
    this.hasAddedArbitraryTestDS = false;
    await this._fetchRegisteredDatasources();
    return Promise.resolve();
  }

  public async updateDatasourcePrivacy(datasourceId: number, privacyObject: UpdatePrivacyDatasourceApiRequestModel) {
    await this._ajax.patch(`/user/${this._session.getUsername()}/data_source/${datasourceId}/privacy`, privacyObject);
    this.hasAddedArbitraryTestDS = false;
    await this._fetchRegisteredDatasources();
    return Promise.resolve();
  }

  public async updateDatasourceUploadGranularity(dsId: number, _freq: number, _unit: DATASOURCE_TIME_UNIT): Promise<void> {
    await this._ajax.patch(`/user/${this._session.getUsername()}/data_source/${dsId}/granularity`, {
      interval: UploadGranularityService.convertUploadIntervalToMilliseconds(_freq, _unit)
    });

    this.hasAddedArbitraryTestDS = false;
    await this._fetchRegisteredDatasources();
    return Promise.resolve();
  }

  public getDataFromDatasource(dsName: string, from: Date, until: Date): Promise<DataFromDatasourceApiResponseModel[]> {
    return this._ajax.get(`/user/${this._session.getUsername()}/data/${dsName}?interval_begin=${Number(from)}&interval_end=${Number(until)}`);
  }
}
