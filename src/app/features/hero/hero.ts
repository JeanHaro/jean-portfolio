import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ElementRef, viewChild, inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

// Servicios
import { CharacterMovementService } from '@core/services/character-movement/character-movement';

interface StackItem {
  name: string;
  category: 'frontend' | 'ia' | 'tools';
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly characterMovement = inject(CharacterMovementService);
  private timeline?: gsap.core.Timeline;

  // ─── Template refs ────────────────────────────────────────────────
  private readonly greetRef   = viewChild.required<ElementRef>('greet');
  private readonly nameRef    = viewChild.required<ElementRef>('name');
  private readonly titleRef   = viewChild.required<ElementRef>('title');
  private readonly bioRef     = viewChild.required<ElementRef>('bio');
  private readonly stackRef   = viewChild.required<ElementRef>('stack');
  private readonly buttonsRef = viewChild.required<ElementRef>('buttons');
  private readonly hintRef    = viewChild.required<ElementRef>('hint');

  // ─── Stack ────────────────────────────────────────────────────────
  readonly stackItems: StackItem[] = [
    { name: 'Angular',     category: 'frontend' },
    { name: 'TypeScript',  category: 'frontend' },
    { name: 'JavaScript',  category: 'frontend' },
    { name: 'SASS',        category: 'frontend' },
    { name: 'Tailwind',    category: 'frontend' },
    { name: 'Make',        category: 'ia'       },
    { name: 'n8n',         category: 'ia'       },
    { name: 'MCP',         category: 'ia'       },
    { name: 'Git',         category: 'tools'    },
    { name: 'Node.js',     category: 'tools'    },
  ];

  // ─── Lifecycle ───────────────────────────────────────────────────
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Pequeño delay para que el DOM esté pintado antes de animar
    requestAnimationFrame(() => this.playEntrance());
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
  }

  // ─── Animación de entrada ────────────────────────────────────────
  private playEntrance(): void {
    const greet   = this.greetRef().nativeElement;
    const name    = this.nameRef().nativeElement;
    const title   = this.titleRef().nativeElement;
    const bio     = this.bioRef().nativeElement;
    const stack   = this.stackRef().nativeElement;
    const buttons = this.buttonsRef().nativeElement;
    const hint    = this.hintRef().nativeElement;

    // Estado inicial — todo invisible y desplazado
    gsap.set([greet, name, title, bio, stack, buttons, hint], {
      opacity: 0,
      y: 30,
    });

    this.timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(greet,   { opacity: 1, y: 0, duration: 0.5 })
      .to(name,    { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
      .to(title,   { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to(bio,     { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
      .to(stack,   { opacity: 1, y: 0, duration: 0.5 }, '-=0.1')
      .to(buttons, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1')
      .to(hint,    { opacity: 1, y: 0, duration: 0.4 }, '-=0.1');
  }

  // ─── CV download ─────────────────────────────────────────────────
  downloadCV(): void {
    const link    = document.createElement('a');
    link.href     = '/cv-jean-haro.pdf'; // ← pondrás el PDF en public/
    link.download = 'CV_Jean_Carlos_Haro_Luyo.pdf';
    link.click();
  }

  goToProjects(): void {
    this.characterMovement.jumpToSection(4);
  }
}
