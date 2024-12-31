import { TestBed } from '@angular/core/testing';

import { SalePaymentService } from './sale-payment.service';

describe('SalePaymentService', () => {
  let service: SalePaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalePaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
