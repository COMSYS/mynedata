import { TestBed, inject } from '@angular/core/testing';

import { AuthGuardProcessorService } from './auth-guard-processor.service';

describe('AuthGuardProcessorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuardProcessorService]
    });
  });

  it('should be created', inject([AuthGuardProcessorService], (service: AuthGuardProcessorService) => {
    expect(service).toBeTruthy();
  }));
});
