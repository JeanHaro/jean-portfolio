import { Service, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GameStateService, SECTION_POSITIONS } from '@core/services/game-state/game-state';
import { CharacterMovementService } from '@core/services/character-movement/character-movement';
import { CharacterService } from '@core/services/character/character';

export type InputDirection = 'left' | 'right';

@Service()
export class InputService implements OnDestroy {
  private readonly platformId        = inject(PLATFORM_ID);
  private readonly gameState         = inject(GameStateService);
  private readonly characterMovement = inject(CharacterMovementService);
  private readonly character         = inject(CharacterService); // 👈 NUEVO

  private touchStartX = 0;
  private readonly SWIPE_THRESHOLD = 50;

  private readonly onKeyDown    = this.handleKeyDown.bind(this);
  private readonly onTouchStart = this.handleTouchStart.bind(this);
  private readonly onTouchEnd   = this.handleTouchEnd.bind(this);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown',    this.onKeyDown);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchend',   this.onTouchEnd,   { passive: true });
  }

  private unbindEvents(): void {
    window.removeEventListener('keydown',    this.onKeyDown);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend',   this.onTouchEnd);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.isTypingInFormField(e.target)) return;

    switch (e.key) {
      case 'ArrowRight': case 'd': case 'D':
        e.preventDefault();
        this.characterMovement.step('right');
        break;
      case 'ArrowLeft': case 'a': case 'A':
        e.preventDefault();
        this.characterMovement.step('left');
        break;
    }
  }

  private isTypingInFormField(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
  }

  // ─── Mobile — swipe salta de sección directo, reposiciona síncrono ─
  private handleTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (this.gameState.isMoving()) return;

    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD) return;

    const dir: InputDirection = deltaX < 0 ? 'right' : 'left';
    const currentIndex = this.gameState.currentSectionIndex();

    if (dir === 'right' && !this.gameState.isLastSection()) {
      this.character.enterSectionFromEdge(SECTION_POSITIONS[currentIndex + 1], 'right');
    } else if (dir === 'left' && !this.gameState.isFirstSection()) {
      this.character.enterSectionFromEdge(SECTION_POSITIONS[currentIndex - 1], 'left');
    } else {
      return; // ya está en el límite, no hace nada
    }

    this.gameState.lastDirection.set(dir);
    if (dir === 'right') this.gameState.nextSection();
    else                 this.gameState.prevSection();
    this.gameState.isMoving.set(true);
  }

  ngOnDestroy(): void {
    this.unbindEvents();
  }
}
