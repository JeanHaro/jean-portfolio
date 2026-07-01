import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy,
  ElementRef, viewChildren, inject, PLATFORM_ID, signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import gsap from 'gsap';
import { environment } from '@env/environment';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private timeline?: gsap.core.Timeline;

  private readonly cardEls = viewChildren<ElementRef>('cardEl');

  readonly copied = signal(false);
  readonly formState = signal<FormState>('idle');

  // Form fields como signals — sin necesitar ReactiveFormsModule para algo tan simple
  readonly name    = signal('');
  readonly email   = signal('');
  readonly message = signal('');

  readonly email_contact = 'jeanch447@gmail.com';
  readonly whatsapp      = '51951557808';
  readonly linkedin      = 'https://www.linkedin.com/in/jean-carlos-haro/';
  readonly github        = 'https://github.com/JeanHaro';

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => this.playEntrance());
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
  }

  private playEntrance(): void {
    const cards = this.cardEls().map(ref => ref.nativeElement);
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 30 });
    this.timeline = gsap.timeline()
      .to(cards, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 });
  }

  // ─── Copiar email ────────────────────────────────────────────────
  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email_contact);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Fallback silencioso — el navegador puede bloquear clipboard en http no seguro
    }
  }

  // ─── Enviar formulario al webhook de Make ───────────────────────
  submitForm(): void {
    if (!this.name() || !this.email() || !this.message()) return;

    this.formState.set('sending');

    const payload = {
      nombre: this.name(),
      email: this.email(),
      mensaje: this.message(),
      fecha: new Date().toISOString(),
    };

    this.http.post(environment.makeWebhookUrl, payload, { responseType: 'text' }) // 👈 cambio clave
      .subscribe({
        next: () => {
          this.formState.set('sent');
          this.name.set('');
          this.email.set('');
          this.message.set('');
          setTimeout(() => this.formState.set('idle'), 4000);
        },
        error: (err) => {
          console.error('Error real al enviar formulario:', err); // 👈 NUEVO — para diagnosticar si persiste
          this.formState.set('error');
          setTimeout(() => this.formState.set('idle'), 4000);
        },
      });
  }
}
