import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetChartComponent } from './dashboard-widget-chart.component';

describe('DashboardWidgetChartComponent', () => {
  let component: DashboardWidgetChartComponent;
  let fixture: ComponentFixture<DashboardWidgetChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
