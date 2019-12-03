import { TestBed, inject } from '@angular/core/testing';

import { AuthGuardUserService } from './auth-guard-user.service';

describe('AuthGuardUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuardUserService]
    });
  });

  it('should be created', inject([AuthGuardUserService], (service: AuthGuardUserService) => {
    expect(service).toBeTruthy();
  }));
});
