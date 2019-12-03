import { TestBed, inject } from '@angular/core/testing';

import { DataTypesService } from './data-types.service';

describe('DataTypesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataTypesService]
    });
  });

  it('should be created', inject([DataTypesService], (service: DataTypesService) => {
    expect(service).toBeTruthy();
  }));
});
