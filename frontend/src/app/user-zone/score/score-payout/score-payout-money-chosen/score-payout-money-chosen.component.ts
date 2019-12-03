import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-score-payout-money-chosen',
  templateUrl: './score-payout-money-chosen.component.html',
  styleUrls: ['./score-payout-money-chosen.component.css', '../score-payout.component.css', '../../score.component.css']
})
export class ScorePayoutMoneyChosenComponent implements OnInit {
  @Input() goBackToStart: () => {};

  public chosenPayoutVendor = null;

  constructor() { }

  ngOnInit() {
  }

}
