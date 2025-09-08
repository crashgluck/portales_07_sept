import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro-acceso',
    loadComponent: () => import('./pages/registro-acceso/registro-acceso.page').then( m => m.RegistroAccesoPage)
  },
  {
    path: 'registro-list',
    loadComponent: () => import('./pages/registro-acceso/pages/registro-list/registro-list.page').then( m => m.RegistroListPage)
  },
];
