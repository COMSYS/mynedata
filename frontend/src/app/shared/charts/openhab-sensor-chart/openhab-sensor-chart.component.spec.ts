import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenhabSensorChartComponent } from './openhab-sensor-chart.component';

describe('OpenhabSensorChartComponent', () => {
  let component: OpenhabSensorChartComponent;
  let fixture: ComponentFixture<OpenhabSensorChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenhabSensorChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenhabSensorChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
