import { TestBed } from '@angular/core/testing';

import { BoxesBalanceService } from './boxes-balance.service';

describe('BoxesService', () => {
  let service: BoxesBalanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoxesBalanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
