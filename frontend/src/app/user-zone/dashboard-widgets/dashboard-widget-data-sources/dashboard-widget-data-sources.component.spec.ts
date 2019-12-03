import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetDataSourcesComponent } from './dashboard-widget-data-sources.component';

describe('DashboardWidgetDataSourcesComponent', () => {
  let component: DashboardWidgetDataSourcesComponent;
  let fixture: ComponentFixture<DashboardWidgetDataSourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetDataSourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetDataSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
