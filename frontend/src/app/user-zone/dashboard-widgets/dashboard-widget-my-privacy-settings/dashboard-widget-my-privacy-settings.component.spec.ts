import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetMyPrivacySettingsComponent } from './dashboard-widget-my-privacy-settings.component';

describe('DashboardWidgetMyPrivacySettingsComponent', () => {
  let component: DashboardWidgetMyPrivacySettingsComponent;
  let fixture: ComponentFixture<DashboardWidgetMyPrivacySettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetMyPrivacySettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetMyPrivacySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
