import { TestBed, inject } from '@angular/core/testing';

import { MockerService } from './mocker.service';

describe('MockerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockerService]
    });
  });

  it('should be created', inject([MockerService], (service: MockerService) => {
    expect(service).toBeTruthy();
  }));
});
