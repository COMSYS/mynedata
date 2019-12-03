import { Component, OnInit } from '@angular/core';
import {BreadcrumbsService, PathAppendix} from '../../core/services/breadcrumbs.service';
import {SafeHtml} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';
import {LocalizationService} from '../../core/services/localization.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
})
export class BreadcrumbsComponent implements OnInit {

  constructor(private _breadcrumbs: BreadcrumbsService, public locale: LocalizationService) { }

  ngOnInit() {
  }

  public getCrumbs(): PathAppendix[] {
    return this._breadcrumbs.getCrumbsAsArray();
  }

  public createRouterLinkObject(link: string): RouterLink {
    return this._breadcrumbs.createRouterLinkObject(link);
  }

}
