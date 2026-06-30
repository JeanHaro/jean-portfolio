import { Service, signal, computed } from '@angular/core';

export const SECTIONS = [
  'hero',
  'about',
  'skills',
  'experience',
  'projects',
  'achievements',
  'contact',
] as const;

export type Section = (typeof SECTIONS)[number];

// Distancia entre secciones en el mundo 3D (unidades Three.js)
export const SECTION_SPACING = 20;

// Posición X de la cámara para cada sección
export const SECTION_POSITIONS: Record<number, number> = Object.fromEntries(
  SECTIONS.map((_, i) => [i, i * SECTION_SPACING])
);

@Service()
export class GameStateService {
  // ─── ESTADO REACTIVO ─────────────────────────────────────────────
  readonly currentSectionIndex = signal<number>(0);
  readonly isMoving            = signal<boolean>(false);
  readonly scrollX             = signal<number>(0);

  // ─── COMPUTADOS ──────────────────────────────────────────────────
  readonly currentSection  = computed(() => SECTIONS[this.currentSectionIndex()]);
  readonly isFirstSection  = computed(() => this.currentSectionIndex() === 0);
  readonly isLastSection   = computed(() => this.currentSectionIndex() === SECTIONS.length - 1);
  readonly totalSections   = SECTIONS.length;

  // Posición X objetivo de la cámara para la sección actual
  readonly targetCameraX   = computed(() => SECTION_POSITIONS[this.currentSectionIndex()]);

  // ─── NAVEGACIÓN ──────────────────────────────────────────────────
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
