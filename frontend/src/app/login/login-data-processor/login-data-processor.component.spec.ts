import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDataProcessorComponent } from './login-data-processor.component';

describe('LoginDataProcessorComponent', () => {
  let component: LoginDataProcessorComponent;
  let fixture: ComponentFixture<LoginDataProcessorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginDataProcessorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginDataProcessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
