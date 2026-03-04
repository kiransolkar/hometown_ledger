import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'members',
    loadComponent: () => import('./features/members/member-list/member-list.component')
      .then(m => m.MemberListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'members/:id',
    loadComponent: () => import('./features/members/member-detail/member-detail.component')
      .then(m => m.MemberDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/transactions/transaction-list/transaction-list.component')
      .then(m => m.TransactionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'news',
    loadComponent: () => import('./features/news/news-list/news-list.component')
      .then(m => m.NewsListComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'news/:id',
    loadComponent: () => import('./features/news/news-form/news-form.component')
      .then(m => m.NewsFormComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/config',
    loadComponent: () => import('./features/admin/config/config.component')
      .then(m => m.ConfigComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
