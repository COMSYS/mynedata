import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetMyProfileComponent } from './dashboard-widget-my-profile.component';

describe('DashboardWidgetMyProfileComponent', () => {
  let component: DashboardWidgetMyProfileComponent;
  let fixture: ComponentFixture<DashboardWidgetMyProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetMyProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetMyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
