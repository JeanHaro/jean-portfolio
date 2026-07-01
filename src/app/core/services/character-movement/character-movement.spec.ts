import { TestBed } from '@angular/core/testing';

import { CharacterMovementService } from './character-movement';

describe('CharacterMovement', () => {
  let service: CharacterMovementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterMovementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
