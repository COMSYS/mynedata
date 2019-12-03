import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSourceSettingsDialogComponent } from './data-source-settings-dialog.component';

describe('DataSourceSettingsDialogComponent', () => {
  let component: DataSourceSettingsDialogComponent;
  let fixture: ComponentFixture<DataSourceSettingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSourceSettingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSourceSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
