import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'projects/:slug',
    loadComponent: () =>
      import('./features/project-detail/project-detail').then(m => m.ProjectDetailComponent),
  },
];
