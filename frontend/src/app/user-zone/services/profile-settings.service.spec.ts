import { TestBed, inject } from '@angular/core/testing';

import { ProfileSettingsService } from './profile-settings.service';

describe('ProfileSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileSettingsService]
    });
  });

  it('should be created', inject([ProfileSettingsService], (service: ProfileSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
