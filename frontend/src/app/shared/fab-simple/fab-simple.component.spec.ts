import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabSimpleComponent } from './fab-simple.component';

describe('FabSimpleComponent', () => {
  let component: FabSimpleComponent;
  let fixture: ComponentFixture<FabSimpleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabSimpleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
