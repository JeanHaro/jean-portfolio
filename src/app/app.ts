import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

// Componentes
import { CanvasComponent } from './canvas/canvas';
import { LoaderComponent } from '@core/loader/loader';
import { HeroComponent }  from './features/hero/hero';
import { AboutComponent } from './features/about/about';
import { SkillsComponent } from './features/skills/skills';
import { ExperienceComponent } from './features/experience/experience';
import { ProjectsComponent } from './features/projects/projects';
import { AchievementsComponent } from './features/achievements/achievements';
import { ContactComponent } from './features/contact/contact';

// Servicios
import { GameStateService } from '@core/services/game-state/game-state';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,

    // Componentes
    CanvasComponent,
    LoaderComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    ProjectsComponent,
    AchievementsComponent,
    ContactComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly gameState = inject(GameStateService);
  private readonly router = inject(Router);

  // Solo mostramos el juego (canvas + secciones) cuando NO estamos en /projects/:slug
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly isGameRoute = computed(() => !this.currentUrl().startsWith('/projects/'));
}
