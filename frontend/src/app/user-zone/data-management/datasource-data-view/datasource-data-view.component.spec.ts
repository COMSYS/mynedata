import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceDataViewComponent } from './datasource-data-view.component';

describe('DatasourceDataViewComponent', () => {
  let component: DatasourceDataViewComponent;
  let fixture: ComponentFixture<DatasourceDataViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasourceDataViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasourceDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
