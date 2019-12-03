import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDatasourceComponent } from './add-new-datasource.component';

describe('AddNewDatasourceComponent', () => {
  let component: AddNewDatasourceComponent;
  let fixture: ComponentFixture<AddNewDatasourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewDatasourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
