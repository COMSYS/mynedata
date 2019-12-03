import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTypesPrivacyComponent } from './data-types-privacy.component';

describe('DataTypesPrivacyComponent', () => {
  let component: DataTypesPrivacyComponent;
  let fixture: ComponentFixture<DataTypesPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataTypesPrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTypesPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
