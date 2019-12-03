import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestIssuerPrivacyRowComponent } from './request-issuer-privacy-row.component';

describe('RequestIssuerPrivacyRowComponent', () => {
  let component: RequestIssuerPrivacyRowComponent;
  let fixture: ComponentFixture<RequestIssuerPrivacyRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestIssuerPrivacyRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestIssuerPrivacyRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
