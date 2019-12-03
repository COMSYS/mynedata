import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorZoneComponent } from './processor-zone.component';

describe('ProcessorZoneComponent', () => {
  let component: ProcessorZoneComponent;
  let fixture: ComponentFixture<ProcessorZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessorZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessorZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
