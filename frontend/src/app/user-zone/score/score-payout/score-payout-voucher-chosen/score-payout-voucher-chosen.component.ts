import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-score-payout-voucher-chosen',
  templateUrl: './score-payout-voucher-chosen.component.html',
  styleUrls: ['./score-payout-voucher-chosen.component.css', '../score-payout.component.css', '../../score.component.css']
})
export class ScorePayoutVoucherChosenComponent implements OnInit {
  @Input() goBackToStart: () => {};
  constructor() { }

  ngOnInit() {
  }

}
