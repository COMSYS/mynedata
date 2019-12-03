import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalPrivacyComponent } from './global-privacy.component';

describe('GlobalPrivacyComponent', () => {
  let component: GlobalPrivacyComponent;
  let fixture: ComponentFixture<GlobalPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalPrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
