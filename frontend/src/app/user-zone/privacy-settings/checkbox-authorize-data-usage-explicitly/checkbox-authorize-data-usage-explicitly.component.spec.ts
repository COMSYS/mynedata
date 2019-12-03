import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxAuthorizeDataUsageExplicitlyComponent } from './checkbox-authorize-data-usage-explicitly.component';

describe('CheckboxAuthorizeDataUsageExplicitlyComponent', () => {
  let component: CheckboxAuthorizeDataUsageExplicitlyComponent;
  let fixture: ComponentFixture<CheckboxAuthorizeDataUsageExplicitlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxAuthorizeDataUsageExplicitlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxAuthorizeDataUsageExplicitlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
