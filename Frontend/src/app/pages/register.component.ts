import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>Registro de Usuario</h1>
          <p>Completa el formulario para solicitar acceso</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="fullName">Nombre Completo *</label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                class="form-control"
                [class.error]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
              />
            </div>

            <div class="form-group">
              <label for="email">Correo Electrónico *</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
                [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="position">Posición</label>
              <input
                id="position"
                type="text"
                formControlName="position"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="department">Departamento</label>
              <input
                id="department"
                type="text"
                formControlName="department"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="yearsOfExperience">Años de Experiencia *</label>
            <input
              id="yearsOfExperience"
              type="number"
              formControlName="yearsOfExperience"
              class="form-control"
              min="0"
              [class.error]="registerForm.get('yearsOfExperience')?.invalid && registerForm.get('yearsOfExperience')?.touched"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">Contraseña *</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="form-control"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
              <small>Mínimo 6 caracteres</small>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña *</label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="form-control"
                [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              />
            </div>
          </div>

          <div class="error-message" *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
            Las contraseñas no coinciden
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>

        <div class="register-footer">
          <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
      padding: 2rem 1rem;
    }

    .register-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      width: 100%;
      max-width: 700px;
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        color: #0056b3;
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
      }

      p {
        color: #6c757d;
        font-size: 0.95rem;
        margin: 0;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }

      small {
        color: #6c757d;
        font-size: 0.85rem;
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
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8d7da;
      border-radius: 6px;
      border-left: 4px solid #dc3545;
    }

    .success-message {
      color: #28a745;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #d4edda;
      border-radius: 6px;
      border-left: 4px solid #28a745;
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

    .register-footer {
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      position: [''],
      department: [''],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Dividir el nombre completo en firstName y lastName
      const fullName = this.registerForm.value.fullName.trim();
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const registerData = {
        firstName: firstName,
        lastName: lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword,
        position: this.registerForm.value.position || null,
        department: this.registerForm.value.department || null,
        hireDate: new Date().toISOString()
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Registro exitoso. Tu cuenta está pendiente de aprobación por HR. Serás notificado por correo.';
          this.registerForm.reset();
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error en registro:', error);
          this.errorMessage = error.error?.message || error.error?.errors?.join(', ') || 'Error al registrar usuario. Intenta nuevamente.';
        }
      });
    }
  }
}
