import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorePayoutMoneyChosenComponent } from './score-payout-money-chosen.component';

describe('ScorePayoutMoneyChosenComponent', () => {
  let component: ScorePayoutMoneyChosenComponent;
  let fixture: ComponentFixture<ScorePayoutMoneyChosenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScorePayoutMoneyChosenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScorePayoutMoneyChosenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
