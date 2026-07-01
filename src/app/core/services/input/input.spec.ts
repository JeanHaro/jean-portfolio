import { TestBed } from '@angular/core/testing';

import { InputService } from './input';

describe('Input', () => {
  let service: InputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
