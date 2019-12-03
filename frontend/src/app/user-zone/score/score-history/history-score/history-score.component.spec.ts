import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryScoreComponent } from './history-score.component';

describe('HistoryScoreComponent', () => {
  let component: HistoryScoreComponent;
  let fixture: ComponentFixture<HistoryScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
