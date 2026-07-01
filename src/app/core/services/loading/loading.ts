import { Service, signal } from '@angular/core';
import * as THREE from 'three';

@Service()
export class LoadingService {
  readonly progress  = signal(0);
  readonly isLoading = signal(true);

  readonly manager = new THREE.LoadingManager();

  constructor() {
    this.manager.onProgress = (_url, loaded, total) => {
      this.progress.set(Math.round((loaded / total) * 100));
    };
    this.manager.onLoad = () => {
      setTimeout(() => this.isLoading.set(false), 400); // pequeño respiro visual al llegar a 100%
    };
  }
}
