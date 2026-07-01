import { Service, inject } from '@angular/core';
import * as THREE from 'three';
import { GameStateService, SECTION_POSITIONS } from '@core/services/game-state/game-state';
import { CharacterService } from '@core/services/character/character';

export type MoveDir = 'up' | 'down' | 'left' | 'right';

@Service()
export class CharacterMovementService {
  private readonly gameState = inject(GameStateService);
  private readonly character = inject(CharacterService);

  private readonly STEP = 1.2;

  step(direction: MoveDir): void {
    if (this.gameState.isMoving()) return;

    const currentIndex = this.gameState.currentSectionIndex();
    const sectionX      = SECTION_POSITIONS[currentIndex];
    const pos            = this.character.getWorldPosition();
    const localX          = pos.x - sectionX;
    const localZ          = pos.z;

    // ─── Arriba/abajo — SOLO movimiento libre, nunca cambia de sección ─
    if (direction === 'up' || direction === 'down') {
      const dz = direction === 'up' ? -this.STEP : this.STEP;
      const newZ = THREE.MathUtils.clamp(localZ + dz, -this.character.BOUNDS_Z, this.character.BOUNDS_Z);
      this.character.moveTo(sectionX + localX, newZ);
      return;
    }

    // ─── Izquierda/derecha — libre hasta el borde, luego cruza sección ─
    const dx = direction === 'right' ? this.STEP : -this.STEP;
    const newLocalX = localX + dx;

    if (newLocalX > this.character.BOUNDS_X) {
      if (this.gameState.isLastSection()) {
        this.character.moveTo(sectionX + this.character.BOUNDS_X, localZ);
        return;
      }
      const nextX = SECTION_POSITIONS[currentIndex + 1];
      this.character.moveTo(nextX - this.character.BOUNDS_X, localZ);
      this.gameState.nextSection();
      this.gameState.isMoving.set(true);
      return;
    }

    if (newLocalX < -this.character.BOUNDS_X) {
      if (this.gameState.isFirstSection()) {
        this.character.moveTo(sectionX - this.character.BOUNDS_X, localZ);
        return;
      }
      const prevX = SECTION_POSITIONS[currentIndex - 1];
      this.character.moveTo(prevX + this.character.BOUNDS_X, localZ);
      this.gameState.prevSection();
      this.gameState.isMoving.set(true);
      return;
    }

    this.character.moveTo(sectionX + newLocalX, localZ);
  }
}
