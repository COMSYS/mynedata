import { Injectable } from '@angular/core';
import {LocalizationService} from './localization.service';
import {SessionService} from './session.service';
import {UserRole} from '../../../config/user-roles.config';

export interface PathAppendix {
  path: string;
  link: string;
}

interface BreadcrumbsState {
  prior?: BreadcrumbsState;
  next?: BreadcrumbsState;
  path: PathAppendix;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  private _root: BreadcrumbsState;
  private _hasSetRoot: boolean;
  private _currentCrumb: BreadcrumbsState;

  constructor(
      private _locale: LocalizationService,
      private _session: SessionService,
  ) {
    this._hasSetRoot = false;
  }

  public getCrumbs(): BreadcrumbsState {
    return this._root;
  }

  public getCrumbsAsArray(): PathAppendix[] {
    return this._transformToArray();
  }

  public moveUp(): boolean {
    if (this._currentCrumb !== this._root) {
      this._currentCrumb = this._currentCrumb.prior;
      this._currentCrumb.next = null;
      return true;
    }
    // if already at root
    return false;
  }

  public moveDown(extraPath: PathAppendix): boolean {
    this._currentCrumb.next = {
      prior: this._currentCrumb,
      path: extraPath
    };
    this._currentCrumb = this._currentCrumb.next;
    return true;
  }

  public setRoot(root: PathAppendix): boolean {
    if (!this._hasSetRoot) {
      this._root = {
        path: root
      };
      this._hasSetRoot = true;
      this._currentCrumb = this._root;
      return true;
    } else {
      return false;
    }
  }

  private _getDepth(): number {
    if (!this._hasSetRoot) {
      return 0;
    } else {
      let _curr = this._root;
      let _depth = 1;
      while (_curr.next) {
        _depth++;
        _curr = _curr.next;
      }
      return _depth;
    }
  }

  public createRouterLinkObject(base: String): any {
    if (this._session.getRole() === UserRole.ENDUSER) {
      return ['../user', {outlets: { view: base }}];
    }
  }

  private _transformToArray(): PathAppendix[] {
    const _arr: PathAppendix[] = [];
    let _curr = this._root;
    for (let i = this._getDepth(); i > 0; i--) {
      _arr.push(_curr.path);
      _curr = _curr.next;
    }
    return _arr;
  }
}
