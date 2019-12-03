import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomDataChartComponent } from './random-data-chart.component';

describe('RandomDataChartComponent', () => {
  let component: RandomDataChartComponent;
  let fixture: ComponentFixture<RandomDataChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RandomDataChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomDataChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
