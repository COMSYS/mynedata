import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryPayoutsComponent } from './history-payouts.component';

describe('HistoryPayoutsComponent', () => {
  let component: HistoryPayoutsComponent;
  let fixture: ComponentFixture<HistoryPayoutsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryPayoutsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryPayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
