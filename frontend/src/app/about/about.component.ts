import {Component, OnInit, AfterViewInit} from '@angular/core';
import {LocalizationService} from '../core/services/localization.service';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit {
  errors: { [key: string]: string } = {};


  constructor (
    public locale: LocalizationService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  updateErrorMessages() {
  }

  onFormChange(): void {
  }
}
