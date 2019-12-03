import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickProfileMenuComponent } from './quick-profile-menu.component';

describe('QuickProfileMenuComponent', () => {
  let component: QuickProfileMenuComponent;
  let fixture: ComponentFixture<QuickProfileMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickProfileMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickProfileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
