import { TestBed } from '@angular/core/testing';

import { CommissionHistoryService } from './commission-history.service';

describe('CommissionHistoryService', () => {
  let service: CommissionHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
