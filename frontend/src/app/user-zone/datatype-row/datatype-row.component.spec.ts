import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatypeRowComponent } from './datatype-row.component';

describe('DatatypeRowComponent', () => {
  let component: DatatypeRowComponent;
  let fixture: ComponentFixture<DatatypeRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatypeRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatypeRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
