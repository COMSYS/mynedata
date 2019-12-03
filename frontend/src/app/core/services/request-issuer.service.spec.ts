import { TestBed, inject } from '@angular/core/testing';

import { RequestIssuerService } from './request-issuer.service';

describe('RequestIssuerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestIssuerService]
    });
  });

  it('should be created', inject([RequestIssuerService], (service: RequestIssuerService) => {
    expect(service).toBeTruthy();
  }));
});
