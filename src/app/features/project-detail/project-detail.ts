import { Component, ChangeDetectionStrategy, inject, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// Componentes
import { DetailCanvasComponent } from '@canvas/detail-canvas/detail-canvas';

// Data
import { PROJECT_DETAILS } from './project-detail-data';

@Component({
  selector: 'app-project-detail',
  imports: [
    RouterLink,

    // Componente
    DetailCanvasComponent
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  private readonly route = inject(ActivatedRoute);
    private readonly meta  = inject(Meta);
  private readonly title = inject(Title);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map(params => params.get('slug') ?? '')),
    { initialValue: '' }
  );

  readonly project = computed(() => PROJECT_DETAILS[this.slug()] ?? null);

  constructor() {
    effect(() => {
      const p = this.project();
      if (!p) return;

      this.title.setTitle(`${p.name} — Jean Carlos Haro Luyo`);
      this.meta.updateTag({ name: 'description', content: p.overview });
      this.meta.updateTag({ property: 'og:title', content: `${p.name} — Jean Carlos Haro Luyo` });
      this.meta.updateTag({ property: 'og:description', content: p.overview });
    });
  }
}
