import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserZoneComponent } from './user-zone.component';

describe('UserZoneComponent', () => {
  let component: UserZoneComponent;
  let fixture: ComponentFixture<UserZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
