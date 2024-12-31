import { TestBed } from '@angular/core/testing';

import { SalesTransactionPaymentService } from './sales-transaction-payment.service';

describe('SalesTransactionPaymentService', () => {
  let service: SalesTransactionPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesTransactionPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
