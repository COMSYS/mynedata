import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import { dashboardConfig } from '../../../config/dashboard.config';
import {BreadcrumbsService} from '../../core/services/breadcrumbs.service';
import {LocalizationService} from '../../core/services/localization.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {AddNewDatasourceComponent} from '../add-new-datasource/add-new-datasource.component';
import {isNull} from 'util';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _refAddNewDatasource: MatDialogRef<AddNewDatasourceComponent>;

  constructor(
      private settingsDialog: MatDialog,
      private chartDialog: MatDialog,
      private addDatasourceDialog: MatDialog,
      private _breadcrumbs: BreadcrumbsService,
      public locale: LocalizationService,
  ) {
    this._breadcrumbs.moveDown({
        path: this.locale.get('dashboard-link-text-sidenav'),
        link: 'dashboard'
    });
  }

  ngOnInit() {
  }

  public isWidgetActive(widget_name: string): boolean {
    for (const widget of dashboardConfig.widgets) {
      if (widget.name === widget_name && widget.active) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy() {
    this._breadcrumbs.moveUp();
  }

  public openAddDatasourceDialog(data?: Object): void {
    this._refAddNewDatasource = this.addDatasourceDialog.open(AddNewDatasourceComponent, {
      data: {
        passedData: data
      }
    });
  }

  public getWidgetPosition(widgetName: string): number {
    for (const widget of dashboardConfig.widgets) {
      if (widget.name === widgetName && widget.active) {
        if (!isNull(widget.order)) {
          return widget.order;
        } else {
          break;
        }
      }
    }
    return NaN;
  }
}
