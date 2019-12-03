import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {LocalizationService} from './localization.service';
import {DatasourceWrapper} from '../../user-zone/services/datasource.service';
import {ToastService} from './toast.service';

export enum HistoryItemType {
  REQUEST_DECLINED,
  REQUEST_ACCEPTED,
  DATASOURCE_ADDED
}

interface HistoryItemId {
  id: number;
}

export interface HistoryItem {
  type: HistoryItemType;
  time: Date;
  data: {} | DatasourceWrapper; // removed the original notification interface, because it needs to be adapted to work with requests interface, if this service is needed any longer
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private _history: (HistoryItem & HistoryItemId)[] = [];
  private _counterId = 0; // it shows the next, not the current, so id 0 is not present, but this is okay because it will probably be obsolete soon

  constructor(
      private _locale: LocalizationService,
      private _toastService: ToastService
  ) { }

  public addToHistory(item: HistoryItem, suppressToast = false): void {
    const _castedItem = item as HistoryItem & HistoryItemId;
    _castedItem.id = this._getNextId();
    if (!suppressToast) {
      const _description = this._buildDescription(item);
      this._toastService.showToast(_description, 'OK');
    }
    this._history.push(_castedItem);
  }

  public getHistory(): HistoryItem[] {
    return this._history;
  }

  private _buildDescription(item: HistoryItem): string {
    return 'dummy description';
  }

  private _getNextId(): number {
    return this._counterId++;
  }
}
