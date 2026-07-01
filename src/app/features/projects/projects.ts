import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ElementRef, viewChildren, inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

interface FeaturedProject {
  name: string;
  description: string;
  stack: string[];
  github: string;
  demo?: string;
  status?: string; // ej. "IA en desarrollo"
}

interface ProjectChip {
  name: string;
  github: string;
}

interface ProjectCategory {
  title: string;
  items: ProjectChip[];
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private timeline?: gsap.core.Timeline;

  private readonly featuredCardEls = viewChildren<ElementRef>('featuredEl');
  private readonly chipEls = viewChildren<ElementRef>('chipEl');

  // ─── PROYECTOS DESTACADOS ────────────────────────────────────────
  readonly featured: FeaturedProject[] = [
    {
      name: 'inventario-app',
      description: 'Sistema de gestión de inventario con Angular 22 (Signals + Signal Forms) y backend en Express/TypeScript. Drawers controlados por query params para deep-linking y navegación nativa.',
      stack: ['Angular 22', 'Signals', 'Express', 'TypeScript'],
      github: 'https://github.com/JeanHaro/inventario-app',
      status: 'IA en desarrollo',
    },
    {
      name: '@jeanharo98/typed-storage',
      description: 'Ecosistema de 4 paquetes publicados en npm: localStorage type-safe con API tipo signal, TTL, sync entre pestañas, migraciones de schema y wrappers nativos para Angular y React.',
      stack: ['TypeScript', 'npm', 'Angular', 'React'],
      github: 'https://github.com/JeanHaro/typed-storage',
      demo: 'https://www.npmjs.com/package/@jeanharo98/typed-storage',
    },
    {
      name: 'front-sports-academy',
      description: 'Plataforma full-stack para gestión de matrículas y pagos de una academia deportiva, con autenticación de doble factor, generación de PDF y notificaciones en tiempo real.',
      stack: ['Angular', 'Node.js', 'REST API', 'JWT'],
      github: 'https://github.com/JeanHaro/front-sports-academy',
    },
    {
      name: '@jeanharo98/ddd-core',
      description: 'Building blocks de Domain-Driven Design para TypeScript: Result, ValueObject, Entity, AggregateRoot y Guard. Cero dependencias, agnóstico de framework.',
      stack: ['TypeScript', 'DDD', 'npm', 'Zero-deps'],
      github: 'https://github.com/JeanHaro/ddd-core',
      demo: 'https://www.npmjs.com/package/@jeanharo98/ddd-core',
    },
  ];

  // ─── TODOS LOS PROYECTOS ─────────────────────────────────────────
  readonly allProjects: ProjectCategory[] = [
    {
      title: 'Angular',
      items: [
        { name: 'front-store',         github: 'https://github.com/JeanHaro/front-store' },
        { name: 'mini-frontend',       github: 'https://github.com/JeanHaro/mini-frontend' },
        { name: 'mini-framework',      github: 'https://github.com/JeanHaro/mini-framework' },
      ],
    },
    {
      title: 'TypeScript',
      items: [
        { name: 'api-hero-roster',  github: 'https://github.com/JeanHaro/api-hero-roster' },
        { name: 'battle-simulator', github: 'https://github.com/JeanHaro/battle-simulator' },
        { name: 'tareas-cli',       github: 'https://github.com/JeanHaro/tareas-cli' },
        { name: 'reportes-cli',     github: 'https://github.com/JeanHaro/reportes-cli' },
        { name: 'calculator-cli',   github: 'https://github.com/JeanHaro/calculator-cli' },
        { name: 'api-rpg',          github: 'https://github.com/JeanHaro/api-rpg' },
        { name: 'mini-orm',         github: 'https://github.com/JeanHaro/mini-orm' },
      ],
    },
    {
      title: 'Backend',
      items: [
        { name: 'inventario-api',        github: 'https://github.com/JeanHaro/inventario-api' },
        { name: 'back-sports-academy',   github: 'https://github.com/JeanHaro/back-sports-academy' },
        { name: 'back-apistore',         github: 'https://github.com/JeanHaro/back-apistore' },
        { name: 'api-rrhh',              github: 'https://github.com/JeanHaro/api-rrhh' },
      ],
    },
    {
      title: 'Librerías npm',
      items: [
        { name: 'typed-storage-angular',   github: 'https://github.com/JeanHaro/typed-storage-angular' },
        { name: 'typed-storage-react',     github: 'https://github.com/JeanHaro/typed-storage-react' },
        { name: 'typed-storage-devtools',  github: 'https://github.com/JeanHaro/typed-storage-devtools' },
        { name: 'ddd-repository',          github: 'https://github.com/JeanHaro/ddd-repository' },
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
    const cards = this.featuredCardEls().map(ref => ref.nativeElement);
    const chips = this.chipEls().map(ref => ref.nativeElement);
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 30 });
    gsap.set(chips, { opacity: 0 });

    this.timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 })
      .to(chips, { opacity: 1, duration: 0.3, stagger: 0.015 }, '-=0.3');
  }
}
