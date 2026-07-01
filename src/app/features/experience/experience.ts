import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ElementRef, viewChildren, inject, PLATFORM_ID, signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

interface Job {
  company: string;
  role: string;
  period: string;
  current: boolean;
  note?: string;
  bullets: string[];
}

@Component({
  selector: 'app-experience',
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private timeline?: gsap.core.Timeline;

  private readonly cardEls = viewChildren<ElementRef>('cardEl');
  private readonly nodeEls = viewChildren<ElementRef>('nodeEl');

  // 👈 NUEVO — solo afecta mobile vía CSS. Havas (índice 2) abierto por defecto
  readonly expandedIndex = signal<number | null>(2);

  readonly jobs: Job[] = [
    {
      company: 'Pisco Technologies',
      role: 'Desarrollador de Software',
      period: 'Oct 2020 — Ene 2021',
      current: false,
      bullets: [
        'Plataforma web con Angular para la inmobiliaria ASEI',
        'Consumo de API Rest, guardianes y rutas con Lazy Load',
        'Formularios reactivos, ViewChild y maquetación admin en Vue.js',
      ],
    },
    {
      company: 'TISMART',
      role: 'Developer Frontend Jr.',
      period: 'Nov 2023 — Jun 2025',
      current: false,
      bullets: [
        'Sistema de gestión de incidencias integrado con Buk, con analytics mensual y exportación a Excel',
        'GPT personalizado integrado con Buk para consultas de RRHH y solicitud de vacaciones',
        'Plataforma de gestión de candidatos (Proyecto Evolver) y mesa de ayuda en Angular para Izipay',
      ],
    },
    {
      company: 'Havas Perú',
      role: 'Frontend Developer',
      period: 'Jul 2025 — Abr 2026',
      current: true,
      note: 'Rol enfocado en mailings y landing pages — no es mi rol principal como Angular Developer',
      bullets: [
        'Mailings HTML/CSS cross-client para Audi, Claro, Mapfre y Prudential',
        'Herramienta interna propia para optimizar producción de mailings',
        'Automatización con Make para QA de mailings en Outlook y Gmail',
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
    const cards = this.cardEls().map(ref => ref.nativeElement);
    const nodes = this.nodeEls().map(ref => ref.nativeElement);
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 40 });
    gsap.set(nodes, { scale: 0 });

    this.timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(nodes, { scale: 1, duration: 0.4, stagger: 0.15 })
      .to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, '-=0.3');
  }

  // 👈 NUEVO — toggle acordeón (solo tiene efecto visual en mobile vía CSS)
  toggleExpand(index: number): void {
    this.expandedIndex.update(current => current === index ? null : index);
  }
}
