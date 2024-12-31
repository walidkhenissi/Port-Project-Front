import { TestBed } from '@angular/core/testing';

import { BeneficiaryBalanceService } from './beneficiary-balance.service';

describe('BeneficiaryBalanceService', () => {
  let service: BeneficiaryBalanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeneficiaryBalanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
