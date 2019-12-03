import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';

@Component({
  selector: 'app-dashboard-widget-my-data',
  templateUrl: './dashboard-widget-my-data.component.html',
  styleUrls: [
    './dashboard-widget-my-data.component.css',
    '../dashboard-widgets.css'
  ]
})
export class DashboardWidgetMyDataComponent implements OnInit {

  constructor(public locale: LocalizationService) { }

  ngOnInit() {
  }

}
