import { TestBed, inject } from '@angular/core/testing';

import { UploadGranularityService } from './upload-granularity.service';

describe('UploadGranularityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UploadGranularityService]
    });
  });

  it('should be created', inject([UploadGranularityService], (service: UploadGranularityService) => {
    expect(service).toBeTruthy();
  }));
});
