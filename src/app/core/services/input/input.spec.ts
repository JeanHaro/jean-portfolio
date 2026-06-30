import { TestBed } from '@angular/core/testing';

import { Input } from './input';

describe('Input', () => {
  let service: Input;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Input);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
