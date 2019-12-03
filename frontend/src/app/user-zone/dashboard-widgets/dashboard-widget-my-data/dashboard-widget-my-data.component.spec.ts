import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetMyDataComponent } from './dashboard-widget-my-data.component';

describe('DashboardWidgetMyDataComponent', () => {
  let component: DashboardWidgetMyDataComponent;
  let fixture: ComponentFixture<DashboardWidgetMyDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetMyDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetMyDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
