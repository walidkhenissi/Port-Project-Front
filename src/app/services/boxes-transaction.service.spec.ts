import { TestBed } from '@angular/core/testing';

import { BoxesTransactionService } from './boxes-transaction.service';

describe('BoxesTransactionService', () => {
  let service: BoxesTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoxesTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
