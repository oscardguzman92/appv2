import { TestBed } from '@angular/core/testing';

import { UserSurveysService } from './user-surveys.service';

describe('UserSurveysService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserSurveysService = TestBed.get(UserSurveysService);
    expect(service).toBeTruthy();
  });
});
