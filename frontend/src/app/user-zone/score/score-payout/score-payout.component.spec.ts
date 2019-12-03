import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorePayoutComponent } from './score-payout.component';

describe('ScorePayoutComponent', () => {
  let component: ScorePayoutComponent;
  let fixture: ComponentFixture<ScorePayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScorePayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScorePayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
