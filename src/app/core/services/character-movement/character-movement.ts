import { Service, inject } from '@angular/core';
import { GameStateService, SECTION_POSITIONS } from '@core/services/game-state/game-state';
import { CharacterService } from '@core/services/character/character';

@Service()
export class CharacterMovementService {
  private readonly gameState = inject(GameStateService);
  private readonly character = inject(CharacterService);

  private readonly STEP = 3;
  // ❌ ELIMINADO: private readonly HALF_ZONE = 9;

  step(direction: 'left' | 'right'): void {
    if (this.gameState.isMoving()) return;

    const boundary = this.character.getMovementBoundary(); // 👈 NUEVO — se calcula cada vez, siempre actualizado con el tamaño real de pantalla

    const currentIndex = this.gameState.currentSectionIndex();
    const sectionX      = SECTION_POSITIONS[currentIndex];
    const currentWorldX = this.character.getWorldX();
    const localOffset    = currentWorldX - sectionX;
    const delta            = direction === 'right' ? this.STEP : -this.STEP;
    const newLocalOffset   = localOffset + delta;

    if (newLocalOffset > boundary) {
      if (this.gameState.isLastSection()) {
        this.character.moveWorldXTo(sectionX + boundary, direction); // 👈 clamp con el MISMO límite
        return;
      }
      const nextX = SECTION_POSITIONS[currentIndex + 1];

      this.gameState.lastDirection.set('right');
      this.character.enterSectionFromEdge(nextX, 'right');
      this.gameState.nextSection();
      this.gameState.isMoving.set(true);
      return;
    }

    if (newLocalOffset < -boundary) {
      if (this.gameState.isFirstSection()) {
        this.character.moveWorldXTo(sectionX - boundary, direction); // 👈 clamp con el MISMO límite
        return;
      }
      const prevX = SECTION_POSITIONS[currentIndex - 1];

      this.gameState.lastDirection.set('left');
      this.character.enterSectionFromEdge(prevX, 'left');
      this.gameState.prevSection();
      this.gameState.isMoving.set(true);
      return;
    }

    this.character.moveWorldXTo(sectionX + newLocalOffset, direction);
  }
}
