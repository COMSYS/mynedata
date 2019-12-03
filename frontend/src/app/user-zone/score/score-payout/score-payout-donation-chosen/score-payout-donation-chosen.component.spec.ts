import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorePayoutDonationChosenComponent } from './score-payout-donation-chosen.component';

describe('ScorePayoutDonationChosenComponent', () => {
  let component: ScorePayoutDonationChosenComponent;
  let fixture: ComponentFixture<ScorePayoutDonationChosenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScorePayoutDonationChosenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScorePayoutDonationChosenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
