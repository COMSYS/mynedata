import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrivacyProtectionComponent } from './privacyProtection.component';

describe('CreatePrivacyProtectionComponent', () => {
  let component: CreatePrivacyProtectionComponent;
  let fixture: ComponentFixture<CreatePrivacyProtectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePrivacyProtectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePrivacyProtectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
