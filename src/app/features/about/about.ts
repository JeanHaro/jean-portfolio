import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ElementRef, viewChild, inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

interface Hobby {
  icon: string;
  label: string;
}

interface Highlight {
  value: string;
  label: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private timeline?: gsap.core.Timeline;

  private readonly avatarRef   = viewChild.required<ElementRef>('avatar');
  private readonly contentRef  = viewChild.required<ElementRef>('content');
  private readonly hobbiesSection = viewChild.required<ElementRef>('hobbiesEl');
  private readonly highlightsSection = viewChild.required<ElementRef>('highlightsEl');

  readonly hobbies: Hobby[] = [
    { icon: '🎾', label: 'Tenis'       },
    { icon: '🎮', label: 'Videojuegos' },
    { icon: '🎵', label: 'Música'      },
    { icon: '📚', label: 'Aprender'    },
  ];

  readonly highlights: Highlight[] = [
    { value: '~3',  label: 'años de experiencia' },
    { value: '4',   label: 'paquetes en npm'      },
    { value: '15+', label: 'proyectos en GitHub'  },
    { value: 'v8 → 22', label: 'versiones Angular'  },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => this.playEntrance());
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
  }

  private playEntrance(): void {
    const avatar     = this.avatarRef().nativeElement;
    const content    = this.contentRef().nativeElement;
    const hobbies    = this.hobbiesSection().nativeElement;
    const highlights = this.highlightsSection().nativeElement;

    gsap.set([avatar, content, hobbies, highlights], { opacity: 0, y: 30 });

    this.timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(avatar,     { opacity: 1, y: 0, duration: 0.6 })
      .to(content,    { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .to(highlights, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .to(hobbies,    { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
  }
}
