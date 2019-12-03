import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrivacyProtectionShortComponent } from './privacyProtectionShort.component';

describe('CreatePrivacyProtectionShortComponent', () => {
  let component: CreatePrivacyProtectionShortComponent;
  let fixture: ComponentFixture<CreatePrivacyProtectionShortComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePrivacyProtectionShortComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePrivacyProtectionShortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
