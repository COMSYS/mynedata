import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstTimeWizardComponent } from './first-time-wizard.component';

describe('FirstTimeWizardComponent', () => {
  let component: FirstTimeWizardComponent;
  let fixture: ComponentFixture<FirstTimeWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstTimeWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstTimeWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
