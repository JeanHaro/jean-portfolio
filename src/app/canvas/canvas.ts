import {
  Component, OnDestroy, afterNextRender,
  inject, viewChild, ElementRef,
  ChangeDetectionStrategy, effect
} from '@angular/core';
import { ThreeEngineService } from '@core/services/three-engine/three-engine';
import { GameStateService }   from '@core/services/game-state/game-state';
import { InputService }       from '@core/services/input/input';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.html',
  styleUrl:    './canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent implements OnDestroy {
  private readonly canvas      = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly threeEngine = inject(ThreeEngineService);
  private readonly gameState   = inject(GameStateService);
  private readonly input       = inject(InputService);   // bootstrappea el input al montar el canvas

  constructor() {
    afterNextRender(() => {
      this.threeEngine.init(this.canvas().nativeElement);
    });

    // Cada vez que cambia targetCameraX (signal) → GSAP mueve la cámara
    effect(() => {
      const targetX = this.gameState.targetCameraX();
      const isFirst = this.gameState.isFirstSection();

      // Marcamos isMoving: true al empezar, false al terminar
      this.gameState.isMoving.set(true);
      this.threeEngine.moveCameraTo(targetX, () => {
        this.gameState.isMoving.set(false);
      });

      // En la primera sección no animamos (es el estado inicial)
      if (isFirst) this.gameState.isMoving.set(false);
    });
  }

  ngOnDestroy(): void {
    this.threeEngine.dispose();
  }
}
