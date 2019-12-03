import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginEndUserComponent } from './login-end-user.component';

describe('LoginEndUserComponent', () => {
  let component: LoginEndUserComponent;
  let fixture: ComponentFixture<LoginEndUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginEndUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginEndUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
