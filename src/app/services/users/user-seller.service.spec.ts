import { TestBed } from '@angular/core/testing';

import { UserSellerService } from './user-seller.service';

describe('UserSellerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserSellerService = TestBed.get(UserSellerService);
    expect(service).toBeTruthy();
  });
});
