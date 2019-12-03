import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-fab-simple',
  templateUrl: './fab-simple.component.html',
  styleUrls: ['./fab-simple.component.css']
})
export class FabSimpleComponent implements OnInit {
  @Input() click: () => {};
  @Input() tooltip: string;

  constructor() { }

  ngOnInit() {
  }

}
