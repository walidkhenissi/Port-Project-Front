import { TestBed } from '@angular/core/testing';

import { BoatActivityTypeService } from './boat-activity-type.service';

describe('BoatActivityTypeService', () => {
  let service: BoatActivityTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoatActivityTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
