import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';

@Component({
  selector: 'app-dialog-warn-setting-privacies',
  templateUrl: './dialog-warn-setting-privacies.component.html',
  styleUrls: ['./dialog-warn-setting-privacies.component.css']
})
export class DialogWarnSettingPrivaciesComponent implements OnInit {

  constructor(
    private _locale: LocalizationService
  ) { }

  ngOnInit() {
  }

  public print(id: string): string {
    return this._locale.get(id);
  }

}
