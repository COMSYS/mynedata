import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetNotificationsComponent } from './dashboard-widget-notifications.component';

describe('DashboardWidgetNotificationsComponent', () => {
  let component: DashboardWidgetNotificationsComponent;
  let fixture: ComponentFixture<DashboardWidgetNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
