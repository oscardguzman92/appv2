import { TestBed } from '@angular/core/testing';

import { MsgErrorService } from './msg-error.service';

describe('MsgErrorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MsgErrorService = TestBed.get(MsgErrorService);
    expect(service).toBeTruthy();
  });
});
