import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componentes
import { CanvasComponent } from './canvas/canvas';
import { HeroComponent }   from './features/hero/hero';
import { GameStateService } from '@core/services/game-state/game-state';
import { AboutComponent } from '@features/about/about';
import { SkillsComponent } from '@features/skills/skills';
import { ExperienceComponent } from '@features/experience/experience';
import { ProjectsComponent } from '@features/projects/projects';
import { AchievementsComponent } from '@features/achievements/achievements';
import { ContactComponent } from '@features/contact/contact';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,

    // Componentes
    CanvasComponent,
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
}
