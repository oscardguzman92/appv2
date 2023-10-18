import { TestBed } from '@angular/core/testing';

import { SuperSellerService } from './super-seller.service';

describe('SuperSellerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SuperSellerService = TestBed.get(SuperSellerService);
    expect(service).toBeTruthy();
  });
});
