import { Service, isDevMode, inject } from '@angular/core';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Stats from 'stats.js';
import gsap from 'gsap';
import { CharacterService } from '@core/services/character/character';

@Service()
export class ThreeEngineService {
  private readonly character = inject(CharacterService);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private resizeObserver?: ResizeObserver;
  private stats?: Stats;
  private clock = new THREE.Clock();
  private initialized = false;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.initScene();
    this.initCamera(canvas);
    this.initRenderer(canvas);
    this.initEnvironment();
    this.initLights();
    this.addTestScene();
    await this.character.load(this.scene, this.camera); // 👈 ahora pasa también la cámara
    this.setupResizeObserver(canvas);
    this.initDevTools();
    this.animate();
    this.initialized = true;
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a0a0f');
    this.scene.fog = new THREE.FogExp2('#0a0a0f', 0.02);
  }

  private initCamera(canvas: HTMLCanvasElement): void {
    const { width, height } = canvas.getBoundingClientRect();
    const isPortrait = height > width;
    const fov        = isPortrait ? 90 : 75;
    const camZ       = isPortrait ? 8 : 6;

    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, camZ);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.camera);
  }

  private initRenderer(canvas: HTMLCanvasElement): void {
    const isMobile = window.innerWidth < 768;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });

    const { width, height } = canvas.getBoundingClientRect();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    this.renderer.shadowMap.enabled = !isMobile;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
  }

  private initEnvironment(): void {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();
  }

  private initLights(): void {
    const ambient = new THREE.AmbientLight('#ffffff', 0.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight('#ffffff', 2);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(2048);
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far  = 50;
    this.scene.add(sun);

    const neon = new THREE.PointLight('#00ffcc', 3, 15);
    neon.position.set(-3, 3, 2);
    this.scene.add(neon);

    const violet = new THREE.PointLight('#7b2fff', 2, 12);
    violet.position.set(4, 1, -2);
    this.scene.add(violet);

    // Luz de relleno anclada a la cámara — siempre ilumina lo que está enfrente
    const fillLight = new THREE.PointLight('#ffffff', 1.8, 10);
    fillLight.position.set(0, 1, 3);
    this.camera.add(fillLight);
  }

  private addTestScene(): void {
    const SECTIONS_TEMP = Array(7).fill(null);
    SECTIONS_TEMP.forEach((_, i) => {
      if (i === 0) return;
      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const mat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? '#7b2fff' : '#ff2fff',
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0.12,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(i * 20, 0.5, -3);
      this.scene.add(mesh);
    });

    const floorGeo = new THREE.PlaneGeometry(200, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#12121a', roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(60, -1, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(200, 100, '#7b2fff', '#1a1a2e');
    grid.position.set(60, -0.99, 0);
    this.scene.add(grid);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.stats?.begin();

    const delta = this.clock.getDelta();
    this.character.update(delta);

    this.renderer.render(this.scene, this.camera);
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
    this.resizeObserver = new ResizeObserver(() => {
      const width     = window.innerWidth;
      const height    = window.innerHeight;
      const isPortrait = height > width;

      this.camera.fov      = isPortrait ? 90 : 75;
      this.camera.aspect   = width / height;
      this.camera.position.z = isPortrait ? 8 : 6;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    });

    this.resizeObserver.observe(canvas.parentElement ?? document.body);
  }

  private initDevTools(): void {
    if (!isDevMode()) return;
    this.stats = new Stats();
    this.stats.showPanel(0);
    Object.assign(this.stats.dom.style, { position: 'fixed', bottom: '0', right: '0', top: 'auto', left: 'auto', zIndex: '9999' });
    document.body.appendChild(this.stats.dom);
  }

  getScene():  THREE.Scene             { return this.scene;  }
  getCamera(): THREE.PerspectiveCamera { return this.camera; }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    this.renderer.dispose();
    this.character.dispose();
    if (this.stats?.dom.parentNode) document.body.removeChild(this.stats.dom);
  }
}
