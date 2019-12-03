import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetMySalesComponent } from './dashboard-widget-my-sales.component';

describe('DashboardWidgetMySalesComponent', () => {
  let component: DashboardWidgetMySalesComponent;
  let fixture: ComponentFixture<DashboardWidgetMySalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetMySalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetMySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
