import { Service } from '@angular/core';
import * as THREE from 'three';
import { SECTION_POSITIONS } from '@core/services/game-state/game-state';

const CYAN   = '#00ffcc';
const VIOLET = '#7b2fff';
const MAGENTA= '#ff2fff';

@Service()
export class WorldService {
  private groups: THREE.Group[] = [];

  build(scene: THREE.Scene): void {
    this.buildHero(scene, SECTION_POSITIONS[0]);
    this.buildAbout(scene, SECTION_POSITIONS[1]);
    this.buildSkills(scene, SECTION_POSITIONS[2]);
    this.buildExperience(scene, SECTION_POSITIONS[3]);
    this.buildProjects(scene, SECTION_POSITIONS[4]);
    this.buildAchievements(scene, SECTION_POSITIONS[5]);
    this.buildContact(scene, SECTION_POSITIONS[6]);
    this.buildFloorAndGrid(scene);
  }

  // ─── 1. HERO — anillo de partículas pulsando ──────────────────────
  private buildHero(scene: THREE.Scene, x: number): void {
    const group = new THREE.Group();
    group.position.set(x, 0, -6);

    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 5 + Math.sin(i * 0.5) * 0.6;
      positions[i * 3]     = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(i * 0.3) * 0.8 + 1.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: CYAN, size: 0.06, transparent: true, opacity: 0.7 });
    group.add(new THREE.Points(geo, mat));

    group.userData['spinSpeed'] = 0.05;
    scene.add(group);
    this.groups.push(group);
  }

  // ─── 2. ABOUT — cristal violeta flotando ──────────────────────────
  private buildAbout(scene: THREE.Scene, x: number): void {
    const group = new THREE.Group();
    group.position.set(x + 5, 2, -5);

    const geo = new THREE.OctahedronGeometry(1.4, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: VIOLET, emissive: VIOLET, emissiveIntensity: 0.4,
      roughness: 0.2, metalness: 0.6, transparent: true, opacity: 0.5, wireframe: false,
    });
    const crystal = new THREE.Mesh(geo, mat);
    group.add(crystal);

    const wireMat = new THREE.MeshBasicMaterial({ color: VIOLET, wireframe: true, transparent: true, opacity: 0.4 });
    const wireCrystal = new THREE.Mesh(geo.clone().scale(1.15, 1.15, 1.15), wireMat);
    group.add(wireCrystal);

    group.userData['spinSpeed'] = 0.3;
    group.userData['bobSpeed']  = 1.2;
    scene.add(group);
    this.groups.push(group);
  }

  // ─── 3. SKILLS — 3 nudos toroidales orbitando (representan las 3 categorías) ─
  private buildSkills(scene: THREE.Scene, x: number): void {
    const colors = [CYAN, VIOLET, '#8a8a9a'];
    colors.forEach((color, i) => {
      const group = new THREE.Group();
      const angle = (i / 3) * Math.PI * 2;
      group.position.set(x + Math.cos(angle) * 6, 1.5 + i * 0.4, -6 + Math.sin(angle) * 6);

      const geo = new THREE.TorusKnotGeometry(0.6, 0.18, 64, 8);
      const mat = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.7,
      });
      group.add(new THREE.Mesh(geo, mat));

      group.userData['spinSpeed'] = 0.4 + i * 0.15;
      scene.add(group);
      this.groups.push(group);
    });
  }

  // ─── 4. EXPERIENCE — 3 pilares de distinta altura (línea de tiempo) ─
  private buildExperience(scene: THREE.Scene, x: number): void {
    const heights = [1.5, 2.4, 3.2];
    heights.forEach((h, i) => {
      const group = new THREE.Group();
      group.position.set(x - 6 + i * 6, h / 2, -7);

      const geo = new THREE.CylinderGeometry(0.35, 0.45, h, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: i === 2 ? CYAN : '#7b2fff', emissive: i === 2 ? CYAN : VIOLET,
        emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.6, transparent: true, opacity: 0.35,
      });
      group.add(new THREE.Mesh(geo, mat));

      group.userData['spinSpeed'] = 0.1;
      scene.add(group);
      this.groups.push(group);
    });
  }

  // ─── 5. PROJECTS — paneles flotando tipo tarjetas ─────────────────
  private buildProjects(scene: THREE.Scene, x: number): void {
    for (let i = 0; i < 4; i++) {
      const group = new THREE.Group();
      const angle = (i / 4) * Math.PI * 2;
      group.position.set(x + Math.cos(angle) * 5.5, 1.8 + Math.sin(i) * 0.5, -6 + Math.sin(angle) * 5.5);
      group.rotation.y = angle;

      const geo = new THREE.PlaneGeometry(1.6, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? CYAN : VIOLET, emissive: i % 2 === 0 ? CYAN : VIOLET,
        emissiveIntensity: 0.25, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 0.3, side: THREE.DoubleSide,
      });
      group.add(new THREE.Mesh(geo, mat));

      group.userData['bobSpeed'] = 1 + i * 0.2;
      scene.add(group);
      this.groups.push(group);
    }
  }

  // ─── 6. ACHIEVEMENTS — núcleo brillante + estrellas alrededor ────
  private buildAchievements(scene: THREE.Scene, x: number): void {
    const coreGroup = new THREE.Group();
    coreGroup.position.set(x + 5, 2.2, -5);

    const coreGeo = new THREE.IcosahedronGeometry(1, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: CYAN, emissive: CYAN, emissiveIntensity: 0.7, roughness: 0.1, metalness: 0.9,
    });
    coreGroup.add(new THREE.Mesh(coreGeo, coreMat));
    coreGroup.userData['spinSpeed'] = 0.25;
    scene.add(coreGroup);
    this.groups.push(coreGroup);

    // Estrellas dispersas
    const starCount = 60;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3]     = x + 5 + (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = 0.5 + Math.random() * 5;
      positions[i * 3 + 2] = -8 + (Math.random() - 0.5) * 8;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.04, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));
  }

  // ─── 7. CONTACT — anillo tipo portal ──────────────────────────────
  private buildContact(scene: THREE.Scene, x: number): void {
    const group = new THREE.Group();
    group.position.set(x + 5, 2, -6);
    group.rotation.x = Math.PI / 2.3;

    const geo = new THREE.TorusGeometry(2.2, 0.08, 16, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: CYAN, emissive: CYAN, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.8,
    });
    group.add(new THREE.Mesh(geo, mat));

    const geo2 = new THREE.TorusGeometry(1.6, 0.05, 16, 64);
    const mat2 = new THREE.MeshStandardMaterial({
      color: VIOLET, emissive: VIOLET, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.8,
    });
    const inner = new THREE.Mesh(geo2, mat2);
    group.add(inner);

    group.userData['spinSpeed'] = 0.3;
    group.userData['innerRing'] = inner;
    scene.add(group);
    this.groups.push(group);
  }

  // ─── Suelo + grid, una sola vez para todo el recorrido ────────────
  private buildFloorAndGrid(scene: THREE.Scene): void {
    const floorGeo = new THREE.PlaneGeometry(200, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#12121a', roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(60, -1, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(200, 100, '#7b2fff', '#1a1a2e');
    grid.position.set(60, -0.99, 0);
    scene.add(grid);
  }

  // ─── Update — se llama cada frame ─────────────────────────────────
  update(delta: number): void {
    this.groups.forEach((group) => {
      const spin = group.userData['spinSpeed'];
      if (spin) group.rotation.y += spin * delta;

      const bob = group.userData['bobSpeed'];
      if (bob) group.position.y += Math.sin(performance.now() * 0.001 * bob) * 0.002;

      const innerRing = group.userData['innerRing'] as THREE.Mesh | undefined;
      if (innerRing) innerRing.rotation.z += delta * 0.5;
    });
  }
}
