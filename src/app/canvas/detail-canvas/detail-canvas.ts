import {
  Component, OnDestroy, afterNextRender,
  input, viewChild, ElementRef, ChangeDetectionStrategy
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-detail-canvas',
  templateUrl: './detail-canvas.html',
  styleUrl: './detail-canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCanvasComponent implements OnDestroy {
  readonly accentColor = input.required<string>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private core!: THREE.Mesh;
  private particles!: THREE.Points;
  private animationId!: number;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => this.init());
  }

  private init(): void {
    const canvasEl = this.canvas().nativeElement;
    const color = new THREE.Color(this.accentColor());

    // ─── Escena ────────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a0a0f');
    this.scene.fog = new THREE.FogExp2('#0a0a0f', 0.035);

    // ─── Cámara ────────────────────────────────────────────────────
    const { width, height } = canvasEl.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    // ─── Renderer ──────────────────────────────────────────────────
    const isMobile = window.innerWidth < 768;
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      antialias: !isMobile,
      alpha: false,
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

    // ─── Luces ─────────────────────────────────────────────────────
    this.scene.add(new THREE.AmbientLight('#ffffff', 0.3));
    const point = new THREE.PointLight(color, 4, 15);
    point.position.set(2, 2, 3);
    this.scene.add(point);

    // ─── Núcleo — icosaedro wireframe con el color de acento ────────
    const coreGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(this.core);

    // ─── Partículas orbitando ────────────────────────────────────────
    const particleCount = isMobile ? 200 : 400;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);

    this.setupResize(canvasEl);
    this.animate();
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    this.core.rotation.x += 0.002;
    this.core.rotation.y += 0.003;
    this.particles.rotation.y += 0.0006;

    this.renderer.render(this.scene, this.camera);
  };

  private setupResize(canvasEl: HTMLCanvasElement): void {
    this.resizeObserver = new ResizeObserver(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    });
    this.resizeObserver.observe(canvasEl.parentElement ?? document.body);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    this.renderer?.dispose();
  }
}
