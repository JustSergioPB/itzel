import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Videos } from './views/videos/videos';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Videos,
      },
    ],
  },
];
