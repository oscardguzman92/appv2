import { TestBed } from '@angular/core/testing';

import { TransporterService } from './transporter.service';

describe('TransporterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransporterService = TestBed.get(TransporterService);
    expect(service).toBeTruthy();
  });
});
