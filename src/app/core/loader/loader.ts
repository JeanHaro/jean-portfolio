import {
  Component, ChangeDetectionStrategy, inject, effect,
  ElementRef, viewChild, OnInit, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { LoadingService } from '@core/services/loading/loading';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly loading = inject(LoadingService);

  private readonly overlayRef = viewChild.required<ElementRef>('overlay');
  private readonly barRef     = viewChild.required<ElementRef>('bar');
  private readonly carRef     = viewChild.required<ElementRef>('carIcon');

  constructor() {
    // Barra de progreso animada suavemente con GSAP en cada cambio
    effect(() => {
      const progress = this.loading.progress();
      const bar = this.barRef()?.nativeElement;
      if (bar) gsap.to(bar, { width: `${progress}%`, duration: 0.4, ease: 'power2.out' });
    });

    // Cuando termina de cargar, desvanece el overlay completo
    effect(() => {
      if (!this.loading.isLoading()) this.hide();
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => {
      const car = this.carRef()?.nativeElement;
      if (car) {
        gsap.to(car, {
          rotation: 6,
          duration: 0.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          transformOrigin: 'center center',
        });
      }
    });
  }

  private hide(): void {
    const overlay = this.overlayRef()?.nativeElement;
    if (!overlay) return;
    gsap.to(overlay, {
      opacity: 0,
      scale: 1.05,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => { overlay.style.display = 'none'; },
    });
  }
}
