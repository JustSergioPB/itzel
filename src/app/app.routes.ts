import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { VideosList } from './views/videos-list/videos-list';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: VideosList,
      },
    ],
  },
];
