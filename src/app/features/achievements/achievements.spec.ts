import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementsComponent } from './achievements';

describe('Achievements', () => {
  let component: AchievementsComponent;
  let fixture: ComponentFixture<AchievementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
