import {Injectable} from '@angular/core';
import {LocalizationService} from './localization.service';
import {DataType, DataTypes, datatypesConfigs} from '../../../config/data-types.config';
import {LoggerService} from './logger.service';
import {privacyConfig} from '../../../config/privacy.config';

@Injectable({
  providedIn: 'root'
})
export class DataTypesService {
  readonly _dataTypesConfigs: DataType[] = [];

  constructor(
      private _locale: LocalizationService,
      private _logger: LoggerService
  ) {
    this._dataTypesConfigs = datatypesConfigs;
  }

  public getDataTypes(): DataType[] {
    return this._dataTypesConfigs;
  }

  public setPrivacy(id: DataTypes, privacy: number): void {
    if (privacy >= privacyConfig.min && privacy <= privacyConfig.max) {
      const datatype = this._getAssociatedDatatype(id);
      datatype.privacy = privacy;
      return;
    }
  }

  /**
   *
   * @param id of enum DataTypes in data-types.config.ts
   * return returns the privacy level for the given datatype or -1 to indicate that the datasource doesn't exist, has no privacy set yet
   *        or the set privacy level exceeds the bounds given by the config
   */
  public getPrivacy(id: DataTypes): number {
    const datatype = this._getAssociatedDatatype(id);
    if (datatype && datatype.privacy && datatype.privacy >= privacyConfig.min && datatype.privacy <= privacyConfig.max) {
      return datatype.privacy;
    } else {
      return privacyConfig.max;
    }
  }

  public enable(id: DataTypes): void {
    const datatype = this._getAssociatedDatatype(id);
    datatype.isEnabled = true;
  }

  public disable(id: DataTypes): void {
    const datatype = this._getAssociatedDatatype(id);
    datatype.isEnabled = false;
  }

  public isEnabled(id: DataTypes): boolean {
    const datatype = this._getAssociatedDatatype(id);
    return datatype.isEnabled;
  }

  private _getAssociatedDatatype(id: DataTypes): DataType {
    for (const datatype of this._dataTypesConfigs) {
      if (datatype.id === id) {
        return datatype;
      }
    }
    this._logger.print('(via ID) Tried to get a datatype that doesn\'t exist.');
    return null;
  }

  public getDatatypeLocaleIdentifierById(id: DataTypes): string {
    return DataTypes[id] as string;
  }

  public getDataTypeById(id: DataTypes): DataType {
    return this._getAssociatedDatatype(id);
  }

  public getDataTypeIdByStringLiteral(literal: string): DataTypes {
    return Number(Object.keys(DataTypes).find(_key => DataTypes[_key] === literal.toUpperCase()));
  }

  public getNumberOfDataTypes(): number {
    return Object.keys(DataTypes).length / 2;
  }

  public getDataTypeObjectWithPrivacyDifferentFromDefaultValue(id: number, privacy: number): DataType {
    const dt = this._getAssociatedDatatype(id);
    dt.privacy = privacy;
    dt.isEnabled = privacy !== privacyConfig.none;
    return dt;
  }
}
