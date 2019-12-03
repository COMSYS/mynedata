import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQueryByTypeSpeedDialFabComponent } from './add-query-by-type-speed-dial-fab.component';

describe('AddQueryByTypeSpeedDialFabComponent', () => {
  let component: AddQueryByTypeSpeedDialFabComponent;
  let fixture: ComponentFixture<AddQueryByTypeSpeedDialFabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddQueryByTypeSpeedDialFabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddQueryByTypeSpeedDialFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
