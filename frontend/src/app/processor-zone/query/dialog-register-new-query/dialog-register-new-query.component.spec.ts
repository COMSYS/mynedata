import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRegisterNewQueryComponent } from './dialog-register-new-query.component';

describe('DialogRegisterNewQueryComponent', () => {
  let component: DialogRegisterNewQueryComponent;
  let fixture: ComponentFixture<DialogRegisterNewQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogRegisterNewQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogRegisterNewQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
