import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ElementRef, viewChildren, inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

interface Highlight {
  title: string;
  org: string;
  period: string;
  description: string;
  badge: string;
}

interface Certification {
  name: string;
  org: string;
  year: string;
  verifyUrl: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.html',
  styleUrl: './achievements.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private timeline?: gsap.core.Timeline;

  private readonly highlightEls = viewChildren<ElementRef>('highlightEl');
  private readonly certEls = viewChildren<ElementRef>('certEl');

  readonly highlights: Highlight[] = [
    {
      title: 'Hackathon Belcorp 5.0',
      org: 'Belcorp',
      period: '2024',
      description: 'Top 25 entre todos los equipos participantes. Propuesta de una IA que recomienda productos Belcorp según las necesidades específicas del usuario.',
      badge: 'Top 25',
    },
    {
      title: 'IEEE UTP Perú',
      org: 'Universidad Tecnológica del Perú',
      period: 'Mar 2019 — Dic 2020',
      description: 'Miembro del grupo de investigación en TI de la universidad, explorando tendencias y proyectos tecnológicos junto a otros estudiantes.',
      badge: 'Miembro',
    },
  ];

  readonly certifications: Certification[] = [
    {
      name: 'SQL Server 2019 Expert',
      org: 'Nextech',
      year: '2021',
      verifyUrl: '#', // Jean: agrega el link de verificación si lo tienes
    },
    {
      name: 'Scrum Fundamentals Certified',
      org: 'VMEDU INC',
      year: '2022',
      verifyUrl: '#',
    },
    {
      name: 'Advanced CSS and Sass — Flexbox, Grid, Animations and More!',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-926fb729-b31a-4587-b529-d9cbbeebac8f/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-926fb729-b31a-4587-b529-d9cbbeebac8f.jpg',
    },
    {
      name: 'Angular de cero a experto',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-676f1aaa-1211-4651-908d-c445ecaa9bbf/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-676f1aaa-1211-4651-908d-c445ecaa9bbf.jpg',
    },
    {
      name: 'Certificación Udemy',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-eebf7880-bde3-4f2f-aaf0-b4beb5994b60/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-eebf7880-bde3-4f2f-aaf0-b4beb5994b60.jpg',
    },
    {
      name: 'JavaScript Moderno — Guía para dominar el lenguaje',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-213130b2-74d8-4918-b9fc-ddce421b0e9c/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-213130b2-74d8-4918-b9fc-ddce421b0e9c.jpg',
    },
    {
      name: 'TypeScript — Tu completa guía y manual de mano',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-6238432c-181e-4ded-b7d0-1565a481b249/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-6238432c-181e-4ded-b7d0-1565a481b249.jpg',
    },
    {
      name: 'TypeScript Developer Course in 2025 — Beginner to Expert',
      org: 'Udemy',
      year: '2025',
      verifyUrl: 'https://www.udemy.com/certificate/UC-0ca64d00-1da5-45a2-8d8c-30f0d7f91a65/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-0ca64d00-1da5-45a2-8d8c-30f0d7f91a65.jpg',
    },
    {
      name: 'Understanding TypeScript',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-54b61353-a8bb-4be7-af69-f9e6c1a3f9b7/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-54b61353-a8bb-4be7-af69-f9e6c1a3f9b7.jpg',
    },
    {
      name: 'Universidad JavaScript — De Cero a Experto!',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-da1cecce-7e31-4bb3-871b-b34d130c1bce/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-da1cecce-7e31-4bb3-871b-b34d130c1bce.jpg',
    },
    {
      name: 'Angular + Node.js (AdminPro)',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-a248677e-7eed-4340-8615-a0525164bb89/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-a248677e-7eed-4340-8615-a0525164bb89.jpg',
    },
    {
      name: 'Certificación Udemy',
      org: 'Udemy',
      year: '2024',
      verifyUrl: 'https://www.udemy.com/certificate/UC-057e0871-dc72-4921-9bda-ecb48b38d4df/',
      imageUrl: 'https://udemy-certificate.s3.amazonaws.com/image/UC-057e0871-dc72-4921-9bda-ecb48b38d4df.jpg',
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
    const highlights = this.highlightEls().map(ref => ref.nativeElement);
    const certs = this.certEls().map(ref => ref.nativeElement);
    if (!highlights.length) return;

    gsap.set(highlights, { opacity: 0, y: 30 });
    gsap.set(certs, { opacity: 0, y: 20 });

    this.timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(highlights, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 })
      .to(certs, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04 }, '-=0.3');
  }
}
