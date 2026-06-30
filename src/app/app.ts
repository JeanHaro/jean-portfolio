import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componente
import { CanvasComponent } from '@canvas/canvas';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CanvasComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
