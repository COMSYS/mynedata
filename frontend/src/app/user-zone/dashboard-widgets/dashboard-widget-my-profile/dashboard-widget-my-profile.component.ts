import { Component, OnInit } from '@angular/core';
import {LocalizationService} from '../../../core/services/localization.service';

@Component({
  selector: 'app-dashboard-widget-my-profile',
  templateUrl: './dashboard-widget-my-profile.component.html',
  styleUrls: [
    './dashboard-widget-my-profile.component.css',
    '../dashboard-widgets.css'
  ]
})
export class DashboardWidgetMyProfileComponent implements OnInit {

  constructor(public locale: LocalizationService) { }

  ngOnInit() {
  }

}
