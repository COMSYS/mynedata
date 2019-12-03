import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWarnSettingPrivaciesComponent } from './dialog-warn-setting-privacies.component';

describe('DialogWarnSettingPrivaciesComponent', () => {
  let component: DialogWarnSettingPrivaciesComponent;
  let fixture: ComponentFixture<DialogWarnSettingPrivaciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogWarnSettingPrivaciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWarnSettingPrivaciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
