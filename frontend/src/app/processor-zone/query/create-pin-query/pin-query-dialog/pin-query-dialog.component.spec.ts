import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinQueryDialogComponent } from './pin-query-dialog.component';

describe('PinQueryDialogComponent', () => {
  let component: PinQueryDialogComponent;
  let fixture: ComponentFixture<PinQueryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinQueryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinQueryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
