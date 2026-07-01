import { TestBed } from '@angular/core/testing';

import { WorldService } from './world';

describe('World', () => {
  let service: WorldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
