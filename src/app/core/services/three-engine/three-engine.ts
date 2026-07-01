import { Service, isDevMode, inject } from '@angular/core';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Stats from 'stats.js';
import gsap from 'gsap';
import { CharacterService } from '@core/services/character/character';
import { WorldService } from '@canvas/world/world';

@Service()
export class ThreeEngineService {
  private readonly character = inject(CharacterService);
  private readonly world     = inject(WorldService);

  // Compartido entre ambas capas
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private animationId!: number;
  private resizeObserver?: ResizeObserver;
  private stats?: Stats;
  private initialized = false;

  // Capa mundo — detrás del texto
  private worldScene!: THREE.Scene;
  private worldRenderer!: THREE.WebGLRenderer;

  // Capa carro — encima del texto
  private carScene!: THREE.Scene;
  private carRenderer!: THREE.WebGLRenderer;

  async init(worldCanvas: HTMLCanvasElement, carCanvas: HTMLCanvasElement): Promise<void> {
    this.initScenes();
    this.initCamera(worldCanvas);
    this.initRenderers(worldCanvas, carCanvas);
    this.initEnvironment();
    this.initWorldLights();
    this.initCarLights(); // 👈 el carro necesita SU PROPIA luz — no comparte escena con el mundo
    this.world.build(this.worldScene);
    await this.character.load(this.carScene, this.camera); // 👈 el carro va a carScene, no worldScene
    this.setupResizeObserver(worldCanvas);
    this.initDevTools();
    this.animate();
    this.initialized = true;
  }

  private initScenes(): void {
    this.worldScene = new THREE.Scene();
    this.worldScene.background = new THREE.Color('#0a0a0f');
    this.worldScene.fog = new THREE.FogExp2('#0a0a0f', 0.02);

    this.carScene = new THREE.Scene();
    this.carScene.background = null; // 👈 CLAVE — sin fondo, se ve transparente
  }

  private initCamera(canvas: HTMLCanvasElement): void {
    const { width, height } = canvas.getBoundingClientRect();

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(0, 18, 0);
    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(0, 0, 0);

    this.worldScene.add(this.camera);
  }

  private initRenderers(worldCanvas: HTMLCanvasElement, carCanvas: HTMLCanvasElement): void {
    const isMobile = window.innerWidth < 768;
    const { width, height } = worldCanvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

    this.worldRenderer = new THREE.WebGLRenderer({
      canvas: worldCanvas, antialias: !isMobile, powerPreference: 'high-performance',
    });
    this.worldRenderer.setSize(width, height, false);
    this.worldRenderer.setPixelRatio(pixelRatio);
    this.worldRenderer.shadowMap.enabled = !isMobile;
    this.worldRenderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.worldRenderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.worldRenderer.toneMappingExposure = 1;
    this.worldRenderer.outputColorSpace    = THREE.SRGBColorSpace;

    this.carRenderer = new THREE.WebGLRenderer({
      canvas: carCanvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance', // 👈 alpha: true — CLAVE
    });
    this.carRenderer.setSize(width, height, false);
    this.carRenderer.setPixelRatio(pixelRatio);
    this.carRenderer.setClearColor(0x000000, 0); // 👈 fondo 100% transparente
    this.carRenderer.outputColorSpace = THREE.SRGBColorSpace;
    this.carRenderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.carRenderer.toneMappingExposure = 1;
  }

  private initEnvironment(): void {
    const pmremGenerator = new THREE.PMREMGenerator(this.worldRenderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.worldScene.environment = envTexture;
    this.carScene.environment   = envTexture; // 👈 mismo mapa de ambiente para que el carro también reciba reflejos
    pmremGenerator.dispose();
  }

  private initWorldLights(): void {
    const ambient = new THREE.AmbientLight('#ffffff', 0.5);
    this.worldScene.add(ambient);

    const sun = new THREE.DirectionalLight('#ffffff', 2);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(2048);
    this.worldScene.add(sun);
  }

  // 👈 NUEVO — el carro vive en una escena distinta, necesita sus propias luces
  private initCarLights(): void {
    const ambient = new THREE.AmbientLight('#ffffff', 0.7);
    this.carScene.add(ambient);

    const sun = new THREE.DirectionalLight('#ffffff', 1.8);
    sun.position.set(3, 8, 3);
    this.carScene.add(sun);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.stats?.begin();

    const delta = this.clock.getDelta();
    this.character.update(delta);
    this.world.update(delta);

    // 👈 2 renders por frame — uno por capa, MISMA cámara
    this.worldRenderer.render(this.worldScene, this.camera);
    this.carRenderer.render(this.carScene, this.camera);

    this.stats?.end();
  };

  moveCameraTo(targetX: number, onComplete?: () => void): void {
    if (!this.initialized || !this.camera) {
      onComplete?.();
      return;
    }
    gsap.to(this.camera.position, { x: targetX, duration: 1.2, ease: 'power2.inOut', onComplete });
  }

  private setupResizeObserver(canvas: HTMLCanvasElement): void {
    const applyResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const isMobile = width < 768;
      const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.worldRenderer.setSize(width, height, false);
      this.worldRenderer.setPixelRatio(pixelRatio);

      this.carRenderer.setSize(width, height, false);
      this.carRenderer.setPixelRatio(pixelRatio);
    };

    this.resizeObserver = new ResizeObserver(applyResize);
    this.resizeObserver.observe(canvas); // 👈 CAMBIO — el canvas mismo, no canvas.parentElement

    applyResize();
  }

  private initDevTools(): void {
    if (!isDevMode()) return;
    this.stats = new Stats();
    this.stats.showPanel(0);
    Object.assign(this.stats.dom.style, { position: 'fixed', bottom: '0', right: '0', top: 'auto', left: 'auto', zIndex: '9999' });
    document.body.appendChild(this.stats.dom);
  }

  getScene():  THREE.Scene             { return this.worldScene; }
  getCamera(): THREE.PerspectiveCamera { return this.camera; }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    this.worldRenderer.dispose();
    this.carRenderer.dispose(); // 👈 limpia ambos
    this.character.dispose();
    if (this.stats?.dom.parentNode) document.body.removeChild(this.stats.dom);
  }
}
