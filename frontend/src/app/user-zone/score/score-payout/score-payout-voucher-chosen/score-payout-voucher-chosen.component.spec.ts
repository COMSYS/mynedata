import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorePayoutVoucherChosenComponent } from './score-payout-voucher-chosen.component';

describe('ScorePayoutVoucherChosenComponent', () => {
  let component: ScorePayoutVoucherChosenComponent;
  let fixture: ComponentFixture<ScorePayoutVoucherChosenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScorePayoutVoucherChosenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScorePayoutVoucherChosenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
