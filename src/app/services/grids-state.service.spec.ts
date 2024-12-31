import { TestBed } from '@angular/core/testing';

import { GridsStateService } from './grids-state.service';

describe('GridsStateService', () => {
  let service: GridsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
