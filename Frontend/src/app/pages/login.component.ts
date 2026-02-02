import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginResponse } from '../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>TalentMatch</h1>
          <p>Sistema de Gestión de Talento Interno</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-control"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">El correo es requerido</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Formato de correo inválido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-control"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="login-footer">
          <p>¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
      padding: 1rem;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        color: #0056b3;
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
      }

      p {
        color: #6c757d;
        font-size: 0.95rem;
        margin: 0;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #0056b3;
          box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
        }

        &.error {
          border-color: #dc3545;
        }
      }
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      display: block;
    }

    .btn {
      width: 100%;
      padding: 0.875rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &.btn-primary {
        background: #0056b3;
        color: white;

        &:hover:not(:disabled) {
          background: #004494;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3);
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }
    }

    .login-footer {
      margin-top: 2rem;
      text-align: center;

      p {
        color: #6c757d;
        font-size: 0.95rem;

        a {
          color: #0056b3;
          text-decoration: none;
          font-weight: 600;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      console.log('Enviando login:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: LoginResponse) => {
          this.isLoading = false;
          const role = response.role;
          if (role === 'HR') {
            this.router.navigate(['/hr']);
          } else if (role === 'Supervisor') {
            this.router.navigate(['/supervisor']);
          } else if (role === 'Employee') {
            this.router.navigate(['/employee']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error en login:', error);
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      });
    }
  }
}
