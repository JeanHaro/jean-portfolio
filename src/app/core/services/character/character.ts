import { Service } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

@Service()
export class CharacterService {
  private model?: THREE.Group;
  private mixer?: THREE.AnimationMixer;
  private camera?: THREE.PerspectiveCamera; // 👈 NUEVO

  private readonly loader = new GLTFLoader();

  private hoverTime = 0;
  private readonly HOVER_AMPLITUDE = 0.15;
  private readonly HOVER_SPEED = 1.8;
  private readonly BASE_Y = 0.7;

  private readonly FACE_RIGHT = THREE.MathUtils.degToRad(25);
  private readonly FACE_LEFT  = THREE.MathUtils.degToRad(-25);

  // ❌ ELIMINADO: readonly ENTRY_OFFSET = 8;

  // 👈 NUEVO — ahora recibe también la cámara
  async load(scene: THREE.Scene, camera: THREE.PerspectiveCamera): Promise<void> {
    this.camera = camera;
    const gltf: GLTF = await this.loader.loadAsync('/assets/models/avatar.glb');

    this.model = gltf.scene;
    this.model.scale.setScalar(1.1);
    this.model.position.set(0, this.BASE_Y, 2.5);
    this.model.rotation.y = this.FACE_RIGHT;

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat?.name === 'Blue_Light') {
          mat.emissive = new THREE.Color('#00eaff');
          mat.emissiveIntensity = 2.2;
        }
      }
    });

    scene.add(this.model);

    if (gltf.animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(this.model);
      const action = this.mixer.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }
  }

  update(delta: number): void {
    if (!this.model) return;
    this.mixer?.update(delta);
    this.hoverTime += delta * this.HOVER_SPEED;
    const bob = Math.sin(this.hoverTime) * this.HOVER_AMPLITUDE;
    this.model.position.y = this.BASE_Y + bob;
  }

  getWorldX(): number {
    return this.model?.position.x ?? 0;
  }

  // 👈 NUEVO — calcula cuánto es "visible" según FOV/aspect real en ese momento
  getMovementBoundary(): number {
    if (!this.camera || !this.model) return 3;
    const distanceZ = Math.abs(this.camera.position.z - this.model.position.z);
    const vFovRad   = THREE.MathUtils.degToRad(this.camera.fov);
    const halfHeight = Math.tan(vFovRad / 2) * distanceZ;
    const halfWidth  = halfHeight * this.camera.aspect;
    return Math.min(halfWidth * 0.75, 7);
  }

  moveWorldXTo(x: number, direction: 'left' | 'right'): void {
    if (!this.model) return;
    const facingY = direction === 'right' ? this.FACE_RIGHT : this.FACE_LEFT;

    gsap.timeline()
      .to(this.model.position, { x, duration: 0.35, ease: 'power2.out' }, 0)
      .to(this.model.rotation, { y: facingY, duration: 0.25, ease: 'power2.out' }, 0)
      .to(this.model.scale, { y: 1.18, duration: 0.12, ease: 'power2.out' }, 0)
      .to(this.model.scale, { y: 1.1,  duration: 0.18, ease: 'power2.in'  }, 0.12);
  }

  enterSectionFromEdge(sectionCenterX: number, direction: 'left' | 'right'): void {
    if (!this.model) return;

    const offset = this.getMovementBoundary(); // 👈 dinámico, ya no ENTRY_OFFSET fijo
    const entryX = direction === 'right'
      ? sectionCenterX - offset
      : sectionCenterX + offset;

    const facingY = direction === 'right' ? this.FACE_RIGHT : this.FACE_LEFT;

    gsap.to(this.model.rotation, { y: facingY, duration: 0.3, ease: 'power2.out' });
    gsap.to(this.model.position, { x: entryX, duration: 1.2, ease: 'power2.inOut' });
  }

  dispose(): void {
    this.mixer?.stopAllAction();
    this.model = undefined;
  }
}
