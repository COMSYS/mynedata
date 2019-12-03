import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryInfoDialogComponent } from './query-info-dialog.component';

describe('QueryInfoDialogComponent', () => {
  let component: QueryInfoDialogComponent;
  let fixture: ComponentFixture<QueryInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
