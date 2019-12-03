import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSettingsHeaderLinkComponent } from './general-settings-header-link.component';

describe('GeneralSettingsHeaderLinkComponent', () => {
  let component: GeneralSettingsHeaderLinkComponent;
  let fixture: ComponentFixture<GeneralSettingsHeaderLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralSettingsHeaderLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralSettingsHeaderLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
