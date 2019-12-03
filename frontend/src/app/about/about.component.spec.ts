import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAboutComponent } from './about.component';

describe('CreateAboutComponent', () => {
  let component: CreateAboutComponent;
  let fixture: ComponentFixture<CreateAboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
