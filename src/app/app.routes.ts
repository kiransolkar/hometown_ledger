import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'members',
    loadComponent: () => import('./features/members/member-list/member-list.component')
      .then(m => m.MemberListComponent)
  },
  {
    path: 'members/:id',
    loadComponent: () => import('./features/members/member-detail/member-detail.component')
      .then(m => m.MemberDetailComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/transactions/transaction-list/transaction-list.component')
      .then(m => m.TransactionListComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
