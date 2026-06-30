import { Service, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { GameStateService } from '@core/services/game-state/game-state';

export type InputDirection = 'left' | 'right';

@Service()
export class InputService implements OnDestroy {
  private readonly platformId    = inject(PLATFORM_ID);
  private readonly gameState     = inject(GameStateService);

  // Observable que emite cada vez que el usuario navega
  readonly direction$ = new Subject<InputDirection>();

  // Touch — guardamos X inicial del toque
  private touchStartX = 0;
  private readonly SWIPE_THRESHOLD = 50; // px mínimos para contar como swipe

  // Referencias a los listeners para poder removerlos en destroy
  private readonly onKeyDown  = this.handleKeyDown.bind(this);
  private readonly onTouchStart = this.handleTouchStart.bind(this);
  private readonly onTouchEnd   = this.handleTouchEnd.bind(this);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return; // SSR safety
    this.bindEvents();
  }

  // ─── BIND / UNBIND ───────────────────────────────────────────────
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

  // ─── KEYBOARD ────────────────────────────────────────────────────
  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        this.navigate('right');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        this.navigate('left');
        break;
    }
  }

  // ─── TOUCH ───────────────────────────────────────────────────────
  private handleTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  private handleTouchEnd(e: TouchEvent): void {
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;

    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD) return; // movimiento muy corto, ignorar

    this.navigate(deltaX < 0 ? 'right' : 'left');
  }

  // ─── NAVIGATE ────────────────────────────────────────────────────
  private navigate(dir: InputDirection): void {
    if (dir === 'right') this.gameState.nextSection();
    else                 this.gameState.prevSection();

    this.direction$.next(dir);
  }

  // ─── DESTROY ─────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.unbindEvents();
    this.direction$.complete();
  }
}
