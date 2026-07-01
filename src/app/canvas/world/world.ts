import { inject, Service } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { SECTION_POSITIONS } from '@core/services/game-state/game-state';
import { LoadingService } from '@core/services/loading/loading';

@Service()
export class WorldService {
  private readonly loadingService = inject(LoadingService);
  private readonly loader = new GLTFLoader(this.loadingService.manager);


  constructor() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  async build(scene: THREE.Scene): Promise<void> {
    this.buildLightingProps(scene);

    const [plant, coffee, books, headphones, pencils, paperclip, typewriter] = await Promise.all([
      this.loader.loadAsync('/assets/models/plant1.glb'),
      this.loader.loadAsync('/assets/models/coffe.glb'),
      this.loader.loadAsync('/assets/models/books.glb'),
      this.loader.loadAsync('/assets/models/headphones.glb'),
      this.loader.loadAsync('/assets/models/pencils.glb'),
      this.loader.loadAsync('/assets/models/paperclip.glb'),
      this.loader.loadAsync('/assets/models/typewriter.glb'),
    ]);

    // Coordenadas seguras — dentro del frustum de la cámara en todo momento
    const DX = 7;   // antes 9
    const DZ = 3.8; // antes 5/5.5/6

    // ─── Hero (0) — 4 props, una por esquina ───────────────────────────
    const heroX = SECTION_POSITIONS[0];
    this.placeProp(scene, coffee.scene,    heroX - DX, -DZ, 3.6, Math.PI / 4);
    this.placeProp(scene, pencils.scene,   heroX + DX, -DZ, 3.0, -0.6);
    this.placeProp(scene, paperclip.scene, heroX - DX,  DZ, 1.6, 0.8);
    this.placeProp(scene, books.scene,     heroX + DX,  DZ, 3.2, -0.4);

    // ─── About (1) ──────────────────────────────────────────────────────
    const aboutX = SECTION_POSITIONS[1];
    this.placeProp(scene, plant.scene, aboutX - DX, -DZ, 4.0, 0.4);
    this.placeProp(scene, plant.scene, aboutX + DX,  DZ, 4.0, -0.6);

    // ─── Skills (2) — antes vacío ───────────────────────────────────────
    const skillsX = SECTION_POSITIONS[2];
    this.placeProp(scene, headphones.scene, skillsX - DX, -DZ, 2.6, 0.3);
    this.placeProp(scene, plant.scene,      skillsX + DX,  DZ, 4.0, -0.3);

    // ─── Experience (3) — antes vacío ────────────────────────────────────
    const expX = SECTION_POSITIONS[3];
    this.placeProp(scene, plant.scene, expX - DX, -DZ, 4.0, 0.7);
    this.placeProp(scene, plant.scene, expX + DX,  DZ, 4.0, -0.2);

    // ─── Projects (4) ───────────────────────────────────────────────────
    const projX = SECTION_POSITIONS[4];
    this.placeProp(scene, pencils.scene, projX + DX, DZ, 3.0, -0.5);
    this.placeProp(scene, plant.scene,   projX - DX, -DZ, 4.0, 0.5);

    // ─── Achievements (5) ───────────────────────────────────────────────
    const achX = SECTION_POSITIONS[5];
    this.placeProp(scene, books.scene,     achX - DX, -DZ, 3.2, -0.4);
    this.placeProp(scene, paperclip.scene, achX + DX,  DZ, 1.6, 0.8);

    // ─── Contact (6) ────────────────────────────────────────────────────
    const contactX = SECTION_POSITIONS[6];
    this.placeProp(scene, typewriter.scene, contactX - 10, -5.2, 3.2, 0.5);
    this.placeProp(scene, plant.scene,      contactX + DX,  DZ, 4.0, -0.4);
  }

  private buildLightingProps(scene: THREE.Scene): void {
    Object.values(SECTION_POSITIONS).forEach((x) => {
      const light = new THREE.PointLight('#fff4e0', 1.2, 14);
      light.position.set(x, 6, 0);
      scene.add(light);
    });
  }

  private placeProp(
    scene: THREE.Scene,
    model: THREE.Object3D,
    x: number,
    z: number,
    targetSize: number,
    rotationY: number
  ): void {
    const instance = model.clone();

    const box = new THREE.Box3().setFromObject(instance);
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension > 0) {
      const scaleFactor = targetSize / maxDimension;
      instance.scale.setScalar(scaleFactor);
    }

    const centeredBox = new THREE.Box3().setFromObject(instance);
    const center = centeredBox.getCenter(new THREE.Vector3());
    instance.position.set(x - center.x, -centeredBox.min.y, z - center.z);

    instance.rotation.y = rotationY;
    this.enableShadows(instance);
    scene.add(instance);
  }

  private enableShadows(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  update(delta: number): void {}
}
