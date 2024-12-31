import { TestBed } from '@angular/core/testing';

import { CommissionValuesService } from './commission-values.service';

describe('CommissionValuesService', () => {
  let service: CommissionValuesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionValuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
