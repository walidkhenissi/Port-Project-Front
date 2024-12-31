import { TestBed } from '@angular/core/testing';

import { CommissionBeneficiaryService } from './commission-beneficiary.service';

describe('CommissionBeneficiaryService', () => {
  let service: CommissionBeneficiaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionBeneficiaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
