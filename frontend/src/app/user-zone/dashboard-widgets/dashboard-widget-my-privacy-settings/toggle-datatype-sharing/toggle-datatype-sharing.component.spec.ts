import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleDatatypeSharingComponent } from './toggle-datatype-sharing.component';

describe('ToggleDatatypeSharingComponent', () => {
  let component: ToggleDatatypeSharingComponent;
  let fixture: ComponentFixture<ToggleDatatypeSharingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleDatatypeSharingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleDatatypeSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
