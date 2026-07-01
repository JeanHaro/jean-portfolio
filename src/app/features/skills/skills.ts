import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ElementRef, viewChildren, inject, PLATFORM_ID, signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

interface Skill {
  name: string;
  level: number;
}

interface SkillCategory {
  title: string;
  accent: 'primary' | 'secondary' | 'neutral';
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private timeline?: gsap.core.Timeline;

  private readonly fillBars = viewChildren<ElementRef>('fillEl');
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabEl'); // 👈 NUEVO

  readonly activeTab = signal<number>(0);

  readonly categories: SkillCategory[] = [
    {
      title: 'Frontend',
      accent: 'primary',
      skills: [
        { name: 'Angular',     level: 5 },
        { name: 'TypeScript',  level: 5 },
        { name: 'JavaScript',  level: 5 },
        { name: 'SASS / BEM',  level: 5 },
        { name: 'TailwindCSS', level: 4 },
        { name: 'Vitest',      level: 4 },
        { name: 'WCAG / a11y', level: 4 },
      ],
    },
    {
      title: 'Automatización & IA',
      accent: 'secondary',
      skills: [
        { name: 'Make',           level: 4 },
        { name: 'n8n',            level: 4 },
        { name: 'MCP (Claude)',   level: 4 },
        { name: 'GPT (OpenAI)',   level: 4 },
        { name: 'Vibe Coding',    level: 5 },
      ],
    },
    {
      title: 'Herramientas',
      accent: 'neutral',
      skills: [
        { name: 'Git / GitHub', level: 5 },
        { name: 'Node.js',      level: 3 },
        { name: 'pnpm',         level: 5 },
        { name: 'Postman',      level: 4 },
        { name: 'Warp',         level: 4 },
      ],
    },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => this.playEntrance());
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
  }

  private playEntrance(): void {
    const bars = this.fillBars().map(ref => ref.nativeElement);
    if (!bars.length) return;

    gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' });

    this.timeline = gsap.timeline()
      .to(bars, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.06,
      });
  }

  levelToWidth(level: number): number {
    return (level / 5) * 100;
  }

  // ─── Cambio de tab + auto-centrado ──────────────────────────────
  setActiveTab(index: number): void {
    this.activeTab.set(index);
    this.centerTab(index);
  }

  private centerTab(index: number): void {
    const button = this.tabButtons()[index]?.nativeElement;
    if (!button) return;

    button.scrollIntoView({
      behavior: 'smooth',
      inline: 'center', // 👈 centra horizontalmente dentro del contenedor scrolleable
      block: 'nearest',  // evita que la página entera haga scroll vertical
    });
  }
}
