import { Component } from '@angular/core';
import {speedDialFabAnimations} from './add-query-by-type-speed-dial-fab.animations';

/*
 big thanks to Aaron Phillips @ https://medium.com/@webdev_aaron/fab-speed-dial-with-angular-5-2-angular-material-be696fc14967
 */

@Component({
  selector: 'app-add-query-by-type-speed-dial-fab',
  templateUrl: './add-query-by-type-speed-dial-fab.component.html',
  styleUrls: ['./add-query-by-type-speed-dial-fab.component.css'],
  animations: speedDialFabAnimations
})
export class AddQueryByTypeSpeedDialFabComponent {
  fabButtons = [
    {
      icon: 'timeline'
    },
    {
      icon: 'view_headline'
    },
    {
      icon: 'room'
    },
    {
      icon: 'lightbulb_outline'
    },
    {
      icon: 'lock'
    }
  ];
  buttons = [];
  fabTogglerState = 'inactive';

  constructor() { }

  public showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons;
  }

  public hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }

  public onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }
}
