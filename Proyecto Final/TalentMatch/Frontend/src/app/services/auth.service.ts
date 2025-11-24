import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Cargar usuario desde localStorage al iniciar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  get userRole(): string | null {
    const user = this.currentUserValue;
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }
    // Retornar el rol más alto: HR > Supervisor > Employee
    if (user.roles.includes('HR')) return 'HR';
    if (user.roles.includes('Supervisor')) return 'Supervisor';
    if (user.roles.includes('Employee')) return 'Employee';
    return null;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/api/account/login`, 
      credentials
    ).pipe(
        tap(response => {
          if (response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/account/register`, 
      data
    );
  }

  logout(): void {
    // Llamar al endpoint de logout del backend
    this.http.post(`${environment.apiUrl}/api/account/logout`, {}).subscribe();
    
    // Limpiar estado local
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user?.roles?.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }
}
