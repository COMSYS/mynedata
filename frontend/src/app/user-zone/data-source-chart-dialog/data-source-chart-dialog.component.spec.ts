import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSourceChartDialogComponent } from './data-source-chart-dialog.component';

describe('DataSourceChartDialogComponent', () => {
  let component: DataSourceChartDialogComponent;
  let fixture: ComponentFixture<DataSourceChartDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSourceChartDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSourceChartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
