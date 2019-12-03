import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestIssuerPrivacyComponent } from './request-issuer-privacy.component';

describe('RequestIssuerPrivacyComponent', () => {
  let component: RequestIssuerPrivacyComponent;
  let fixture: ComponentFixture<RequestIssuerPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestIssuerPrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestIssuerPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
