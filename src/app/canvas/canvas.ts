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
  private readonly input       = inject(InputService);

  constructor() {
    afterNextRender(async () => {
      await this.threeEngine.init(this.canvas().nativeElement);
    });

    effect(() => {
      const targetX = this.gameState.targetCameraX();

      this.threeEngine.moveCameraTo(targetX, () => {
        this.gameState.isMoving.set(false); // 👈 SOLO apaga, nunca enciende aquí
      });
    });
  }

  ngOnDestroy(): void {
    this.threeEngine.dispose();
  }
}
