import { Service, isDevMode } from '@angular/core';
import * as THREE from 'three';
import Stats from 'stats.js';
import gsap from 'gsap';

@Service()
export class ThreeEngineService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private resizeObserver?: ResizeObserver;
  private stats?: Stats;
  private testMesh?: THREE.Mesh;
  private initialized = false;

  init(canvas: HTMLCanvasElement): void {
    this.initScene();
    this.initCamera(canvas);
    this.initRenderer(canvas);
    this.initLights();
    this.addTestScene();
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
  }

  private initLights(): void {
    const ambient = new THREE.AmbientLight('#ffffff', 0.4);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight('#ffffff', 1.5);
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
  }

  private addTestScene(): void {
    const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: '#00ffcc',
      emissive: '#00ffcc',
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.9,
    });
    this.testMesh = new THREE.Mesh(cubeGeo, cubeMat);
    this.testMesh.castShadow = true;
    this.testMesh.position.y = 0.5;
    this.scene.add(this.testMesh);

    // Colocamos 7 cubos — uno por sección — para ver el movimiento horizontal
    SECTIONS_TEMP.forEach((_, i) => {
      if (i === 0) return; // el primero ya existe (testMesh)
      const geo  = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const mat  = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? '#7b2fff' : '#ff2fff',
        roughness: 0.3,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(i * 20, 0.5, 0); // 👈 cada cubo a 20 unidades del anterior
      mesh.castShadow = true;
      this.scene.add(mesh);
    });

    const floorGeo = new THREE.PlaneGeometry(200, 30); // más largo para cubrir todas las secciones
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#12121a',
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(60, -1, 0); // centrado entre todas las secciones
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(200, 100, '#7b2fff', '#1a1a2e');
    grid.position.set(60, -0.99, 0);
    this.scene.add(grid);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.stats?.begin();

    if (this.testMesh) {
      this.testMesh.rotation.x += 0.005;
      this.testMesh.rotation.y += 0.01;
    }

    this.renderer.render(this.scene, this.camera);

    this.stats?.end();
  }

  // ─── API PÚBLICA — GSAP mueve la cámara ──────────────────────────
  moveCameraTo(targetX: number, onComplete?: () => void): void {
    if (!this.initialized || !this.camera) {  // 👈 NUEVO — guard
      onComplete?.();
      return;
    }
    gsap.to(this.camera.position, {
      x:        targetX,
      duration: 1.2,
      ease:     'power2.inOut',
      onComplete,
    });
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
    Object.assign(this.stats.dom.style, {
      position: 'fixed',
      bottom: '0',
      right: '0',
      top: 'auto',        
      left: 'auto',
      zIndex: '9999',
    });
    document.body.appendChild(this.stats.dom);
  }

  getScene():  THREE.Scene             { return this.scene;  }
  getCamera(): THREE.PerspectiveCamera { return this.camera; }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    this.renderer.dispose();

    if (this.stats?.dom.parentNode) {
      document.body.removeChild(this.stats.dom);
    }
  }
}

// TEMP — solo para el test de movimiento horizontal
const SECTIONS_TEMP = Array(7).fill(null);
