import { TestBed, inject } from '@angular/core/testing';

import { PrivacyService } from './privacy.service';

describe('PrivacyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrivacyService]
    });
  });

  it('should be created', inject([PrivacyService], (service: PrivacyService) => {
    expect(service).toBeTruthy();
  }));
});
