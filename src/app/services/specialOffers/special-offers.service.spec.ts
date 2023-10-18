import { TestBed } from '@angular/core/testing';

import { SpecialOffersService } from './special-offers.service';

describe('SpecialOffersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpecialOffersService = TestBed.get(SpecialOffersService);
    expect(service).toBeTruthy();
  });
});
