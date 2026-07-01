import { Service, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

export const SECTIONS = [
  'hero', 'about', 'skills', 'experience', 'projects', 'achievements', 'contact',
] as const;

export type Section = (typeof SECTIONS)[number];
export type NavDirection = 'left' | 'right';

export const SECTION_SPACING = 20;

export const SECTION_POSITIONS: Record<number, number> = Object.fromEntries(
  SECTIONS.map((_, i) => [i, i * SECTION_SPACING])
);

@Service()
export class GameStateService {
  private readonly router = inject(Router);

  readonly currentSectionIndex = signal<number>(0);
  readonly isMoving            = signal<boolean>(false);
  readonly scrollX             = signal<number>(0);
  readonly lastDirection       = signal<NavDirection>('right');

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly isGameRoute = computed(() => !this.currentUrl().startsWith('/projects/'));

  readonly currentSection  = computed(() => SECTIONS[this.currentSectionIndex()]);
  readonly isFirstSection  = computed(() => this.currentSectionIndex() === 0);
  readonly isLastSection   = computed(() => this.currentSectionIndex() === SECTIONS.length - 1);
  readonly totalSections   = SECTIONS.length;
  readonly targetCameraX   = computed(() => SECTION_POSITIONS[this.currentSectionIndex()]);

  goToSection(index: number): void {
    if (index < 0 || index >= SECTIONS.length) return;
    if (this.isMoving()) return;
    this.currentSectionIndex.set(index);
    this.scrollX.set(SECTION_POSITIONS[index]);
  }

  nextSection(): void {
    if (this.isLastSection()) return;
    this.goToSection(this.currentSectionIndex() + 1);
  }

  prevSection(): void {
    if (this.isFirstSection()) return;
    this.goToSection(this.currentSectionIndex() - 1);
  }
}
