import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPinQueryDialogComponent } from './details-pin-query-dialog.component';

describe('DetailsPinQueryDialogComponent', () => {
  let component: DetailsPinQueryDialogComponent;
  let fixture: ComponentFixture<DetailsPinQueryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsPinQueryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsPinQueryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
