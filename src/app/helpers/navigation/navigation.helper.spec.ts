import { TestBed } from '@angular/core/testing';

import { NavigationHelper } from './navigation.helper';

describe('NavigationHelper', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NavigationHelper = TestBed.get(NavigationHelper);
    expect(service).toBeTruthy();
  });
});
