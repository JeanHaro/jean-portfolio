import { inject, Service } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';
import { LoadingService } from '../loading/loading';
import { GameStateService, SECTION_POSITIONS } from '../game-state/game-state';

@Service()
export class CharacterService {
  private model?: THREE.Group;
  private wheels: THREE.Object3D[] = [];
  private camera?: THREE.PerspectiveCamera;

  private readonly gameState = inject(GameStateService);
  private readonly loadingService = inject(LoadingService);
  private readonly loader = new GLTFLoader(this.loadingService.manager);


constructor() {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  this.loader.setDRACOLoader(dracoLoader);
}

  // Límites de movimiento LIBRE dentro de una sección (en unidades de mundo)
  readonly BOUNDS_X = 6;
  readonly BOUNDS_Z = 4;

  async load(scene: THREE.Scene, camera: THREE.PerspectiveCamera): Promise<void> {
    this.camera = camera;
    const gltf: GLTF = await this.loader.loadAsync('/assets/models/vehicle.glb');

    this.model = gltf.scene;
    this.model.scale.setScalar(0.55);
    const currentX = SECTION_POSITIONS[this.gameState.currentSectionIndex()];
    this.model.position.set(currentX, 0, 0);
    
    this.model.rotation.y = Math.PI / 2; // orienta el frente del jeep hacia +X (derecha)

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) child.castShadow = true;
      // Guardamos referencia a las 4 ruedas para rotarlas manualmente
      if (child.name.includes('wheel')) this.wheels.push(child);
    });

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        if (child.name.includes('wheel')) this.wheels.push(child);

        // 👈 NUEVO — recolorea el material "Body" a un tono neutro cálido
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat?.name === 'Body') {
          mat.color.set(''); // para cambiar el color
          mat.roughness = 0.8;
          mat.metalness = 0.8;
        }
      }
    });

    scene.add(this.model);
    // NO reproducimos la animación embebida — rotamos las ruedas nosotros según velocidad
  }

  getWorldPosition(): { x: number; z: number } {
    return { x: this.model?.position.x ?? 0, z: this.model?.position.z ?? 0 };
  }

  //  calcula el ángulo objetivo tomando siempre el camino más corto
  private shortestAngleTarget(current: number, target: number): number {
    const twoPi = Math.PI * 2;
    let delta = (target - current) % twoPi;
    if (delta > Math.PI)  delta -= twoPi;
    if (delta < -Math.PI) delta += twoPi;
    return current + delta;
  }

  moveTo(x: number, z: number): void {
    if (!this.model) return;

    const dx = x - this.model.position.x;
    const dz = z - this.model.position.z;
    const rawAngle = Math.atan2(dx, dz);

    // 👈 CAMBIO — en vez de animar directo a rawAngle, animamos al equivalente más cercano
    const targetAngle = this.shortestAngleTarget(this.model.rotation.y, rawAngle);

    gsap.to(this.model.position, { x, z, duration: 0.3, ease: 'power2.out' });
    gsap.to(this.model.rotation, { y: targetAngle, duration: 0.25, ease: 'power2.out' });

    const distance = Math.sqrt(dx * dx + dz * dz);
    this.wheels.forEach((wheel) => {
      gsap.to(wheel.rotation, { x: wheel.rotation.x + distance * 4, duration: 0.3, ease: 'none' });
    });
  }

  // Agrega este método nuevo, junto a moveWorldXTo:
  driveToSection(targetX: number): void {
    if (!this.model) return;
    gsap.to(this.model.position, { x: targetX, z: 0, duration: 1.0, ease: 'power2.inOut' });
  }

  // En character.ts, agrega antes de dispose():
  update(delta: number): void {
    // Sin animación continua por ahora — el giro de ruedas ya se maneja en moveTo()
  }

  dispose(): void {
    this.model = undefined;
    this.wheels = [];
  }
}
