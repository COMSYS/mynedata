import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePinQueryComponent } from './create-pin-query.component';

describe('CreatePinQueryComponent', () => {
  let component: CreatePinQueryComponent;
  let fixture: ComponentFixture<CreatePinQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePinQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePinQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
