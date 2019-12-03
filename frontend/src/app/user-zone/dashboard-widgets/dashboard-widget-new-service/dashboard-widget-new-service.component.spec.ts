import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetNewServiceComponent } from './dashboard-widget-new-service.component';

describe('DashboardWidgetNewServiceComponent', () => {
  let component: DashboardWidgetNewServiceComponent;
  let fixture: ComponentFixture<DashboardWidgetNewServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetNewServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetNewServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
