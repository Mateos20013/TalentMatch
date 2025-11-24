import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'hr',
    canActivate: [roleGuard(['HR'])],
    loadComponent: () => import('./pages/hr-dashboard.component').then(m => m.HRDashboardComponent)
  },
  {
    path: 'supervisor',
    canActivate: [roleGuard(['Supervisor'])],
    loadComponent: () => import('./pages/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent)
  },
  {
    path: 'employee',
    canActivate: [roleGuard(['Employee', 'Supervisor', 'HR'])],
    loadComponent: () => import('./pages/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
  },
  { path: '**', redirectTo: '/login' }
];
