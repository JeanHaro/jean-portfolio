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
  private readonly worldCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('worldCanvas');
  private readonly carCanvas   = viewChild.required<ElementRef<HTMLCanvasElement>>('carCanvas');
  private readonly threeEngine = inject(ThreeEngineService);
  private readonly gameState   = inject(GameStateService);
  private readonly input       = inject(InputService);

  constructor() {
    afterNextRender(async () => {
      await this.threeEngine.init(
        this.worldCanvas().nativeElement,
        this.carCanvas().nativeElement
      );
    });

    effect(() => {
      const targetX = this.gameState.targetCameraX();
      this.threeEngine.moveCameraTo(targetX, () => {
        this.gameState.isMoving.set(false);
      });
    });
  }

  ngOnDestroy(): void {
    this.threeEngine.dispose();
  }
}
