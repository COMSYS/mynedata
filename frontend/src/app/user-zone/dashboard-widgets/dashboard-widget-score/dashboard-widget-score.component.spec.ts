import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetScoreComponent } from './dashboard-widget-score.component';

describe('DashboardWidgetScoreComponent', () => {
  let component: DashboardWidgetScoreComponent;
  let fixture: ComponentFixture<DashboardWidgetScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
