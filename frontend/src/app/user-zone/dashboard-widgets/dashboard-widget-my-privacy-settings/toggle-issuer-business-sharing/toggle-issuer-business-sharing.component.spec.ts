import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleIssuerBusinessSharingComponent } from './toggle-issuer-business-sharing.component';

describe('ToggleIssuerBusinessSharingComponent', () => {
  let component: ToggleIssuerBusinessSharingComponent;
  let fixture: ComponentFixture<ToggleIssuerBusinessSharingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleIssuerBusinessSharingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleIssuerBusinessSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
