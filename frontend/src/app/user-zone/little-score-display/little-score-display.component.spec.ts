import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LittleScoreDisplayComponent } from './little-score-display.component';

describe('LittleScoreDisplayComponent', () => {
  let component: LittleScoreDisplayComponent;
  let fixture: ComponentFixture<LittleScoreDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LittleScoreDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LittleScoreDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
