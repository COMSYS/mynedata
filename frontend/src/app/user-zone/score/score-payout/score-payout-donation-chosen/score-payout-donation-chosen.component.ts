import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-score-payout-donation-chosen',
  templateUrl: './score-payout-donation-chosen.component.html',
  styleUrls: ['./score-payout-donation-chosen.component.css', '../score-payout.component.css', '../../score.component.css']
})
export class ScorePayoutDonationChosenComponent implements OnInit {
  @Input() goBackToStart: () => {};

  constructor() { }

  ngOnInit() {
  }

}
