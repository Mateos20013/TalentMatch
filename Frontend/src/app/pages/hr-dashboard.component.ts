import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import {
  User,
  JobOffer,
  JobApplication,
  CandidateRecommendation,
  HRDashboardStats,
  JobOfferStatus,
  ApplicationStatus
} from '../models';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Panel de Recursos Humanos</h1>
        <div class="header-actions">
          <span>Bienvenido, {{ currentUser()?.fullName }}</span>
          <button class="btn btn-secondary" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ stats()?.pendingUsersCount || 0 }}</h3>
          <p>Usuarios Pendientes</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats()?.openJobOffersCount || 0 }}</h3>
          <p>Ofertas Activas</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats()?.pendingApplicationsCount || 0 }}</h3>
          <p>Aplicaciones Pendientes</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          *ngFor="let tab of tabs"
          [class.active]="activeTab() === tab.id"
          (click)="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Pending Users Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'pending-users'">
        <h2>Usuarios Pendientes de Aprobación</h2>
        <div class="table-container" *ngIf="pendingUsers().length > 0; else noPendingUsers">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Posición</th>
                <th>Departamento</th>
                <th>Años Exp.</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of pendingUsers()">
                <td>{{ user.fullName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.position || 'N/A' }}</td>
                <td>{{ user.department || 'N/A' }}</td>
                <td>{{ user.yearsOfExperience }}</td>
                <td>
                  <select [(ngModel)]="user.selectedRole" class="role-select">
                    <option value="">Seleccionar rol</option>
                    <option value="Employee">Empleado</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="HR">HR</option>
                  </select>
                  <button class="btn btn-sm btn-primary" (click)="approveUser(user)" [disabled]="!user.selectedRole">
                    Aprobar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noPendingUsers>
          <p class="empty-message">No hay usuarios pendientes de aprobación</p>
        </ng-template>
      </div>

      <!-- Job Offers Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'job-offers'">
        <div class="section-header">
          <h2>Ofertas de Trabajo</h2>
          <button class="btn btn-primary" (click)="showCreateJobOffer = !showCreateJobOffer">
            {{ showCreateJobOffer ? 'Cancelar' : '+ Nueva Oferta' }}
          </button>
        </div>

        <!-- Create Job Offer Form -->
        <div class="card" *ngIf="showCreateJobOffer">
          <h3>Crear Nueva Oferta</h3>
          <form (ngSubmit)="createJobOffer()">
            <div class="form-group">
              <label>Título *</label>
              <input type="text" [(ngModel)]="newJobOffer.title" name="title" required />
            </div>
            <div class="form-group">
              <label>Descripción *</label>
              <textarea [(ngModel)]="newJobOffer.description" name="description" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>Requisitos *</label>
              <textarea [(ngModel)]="newJobOffer.requirements" name="requirements" rows="3" required></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Departamento *</label>
                <input type="text" [(ngModel)]="newJobOffer.department" name="department" required />
              </div>
              <div class="form-group">
                <label>Años Min. Experiencia *</label>
                <input type="number" [(ngModel)]="newJobOffer.minYearsExperience" name="minYears" min="0" required />
              </div>
              <div class="form-group">
                <label>Score Min. Performance *</label>
                <input type="number" [(ngModel)]="newJobOffer.minPerformanceScore" name="minScore" min="0" max="10" step="0.1" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Crear Oferta</button>
          </form>
        </div>

        <!-- Job Offers List -->
        <div class="jobs-grid">
          <div class="card" *ngFor="let job of jobOffers()">
            <div class="job-header">
              <h3>{{ job.title }}</h3>
              <span class="badge" [class.badge-success]="job.status === 'Open'" [class.badge-secondary]="job.status !== 'Open'">
                {{ job.status }}
              </span>
            </div>
            <p><strong>Departamento:</strong> {{ job.department }}</p>
            <p><strong>Descripción:</strong> {{ job.description }}</p>
            <p><strong>Requisitos:</strong> {{ job.requirements }}</p>
            <p><strong>Experiencia mínima:</strong> {{ job.minYearsExperience }} años</p>
            <p><strong>Score mínimo:</strong> {{ job.minPerformanceScore }}</p>
            <p><strong>Aplicaciones:</strong> {{ job.applications.length || 0 }}</p>
            <div class="job-actions">
              <button class="btn btn-sm btn-primary" (click)="viewRecommendedCandidates(job.id)">
                Ver Candidatos Recomendados
              </button>
              <button class="btn btn-sm btn-secondary" (click)="viewApplications(job.id)">
                Ver Aplicaciones
              </button>
              <button class="btn btn-sm btn-danger" *ngIf="job.status === 'Open'" (click)="closeJobOffer(job.id)">
                Cerrar Oferta
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommended Candidates Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'candidates'">
        <h2>Candidatos Recomendados - {{ selectedJobOfferTitle() }}</h2>
        <div class="table-container" *ngIf="recommendedCandidates().length > 0; else noCandidates">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Posición</th>
                <th>Años Exp.</th>
                <th>Score Match</th>
                <th>Score Performance</th>
                <th>Logros</th>
                <th>Certificados</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let candidate of recommendedCandidates()">
                <td>{{ candidate.fullName }}</td>
                <td>{{ candidate.email }}</td>
                <td>{{ candidate.position || 'N/A' }}</td>
                <td>{{ candidate.yearsOfExperience }}</td>
                <td><strong>{{ candidate.matchScore.toFixed(2) }}</strong></td>
                <td>{{ candidate.performanceScore.toFixed(2) }}</td>
                <td>{{ candidate.achievementsCount }}</td>
                <td>{{ candidate.certificatesCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noCandidates>
          <p class="empty-message">No hay candidatos recomendados para esta oferta</p>
        </ng-template>
      </div>

      <!-- Applications Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'applications'">
        <h2>Aplicaciones - {{ selectedJobOfferTitle() }}</h2>
        <div class="table-container" *ngIf="applications().length > 0; else noApplications">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha Aplicación</th>
                <th>Match Score</th>
                <th>Estado</th>
                <th>Notas HR</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of applications()">
                <td>{{ app.applicant?.fullName }}</td>
                <td>{{ app.applicant?.email }}</td>
                <td>{{ app.applicationDate | date:'short' }}</td>
                <td><strong>{{ app.matchScore.toFixed(2) }}</strong></td>
                <td>
                  <span class="badge"
                    [class.badge-warning]="app.status === 'Pending'"
                    [class.badge-info]="app.status === 'UnderReview'"
                    [class.badge-success]="app.status === 'Accepted'"
                    [class.badge-danger]="app.status === 'Rejected'">
                    {{ app.status }}
                  </span>
                </td>
                <td>
                  <input type="text" [(ngModel)]="app.hrNotes" placeholder="Agregar notas..." />
                </td>
                <td>
                  <select [(ngModel)]="app.newStatus" class="status-select">
                    <option value="Pending">Pendiente</option>
                    <option value="UnderReview">En Revisión</option>
                    <option value="Accepted">Aceptado</option>
                    <option value="Rejected">Rechazado</option>
                  </select>
                  <button class="btn btn-sm btn-primary" (click)="updateApplicationStatus(app)">
                    Actualizar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noApplications>
          <p class="empty-message">No hay aplicaciones para esta oferta</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f5f7fa;
      padding: 2rem;
    }

    .dashboard-header {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 {
        color: #0056b3;
        margin: 0;
        font-size: 1.8rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;

        span {
          color: #6c757d;
          font-weight: 500;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;

      h3 {
        color: #0056b3;
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
      }

      p {
        color: #6c757d;
        margin: 0;
        font-size: 1rem;
      }
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e0e0e0;

      button {
        padding: 0.875rem 1.5rem;
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        color: #6c757d;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          color: #0056b3;
          border-bottom-color: #0056b3;
        }

        &:hover {
          color: #0056b3;
        }
      }
    }

    .tab-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        color: #333;
        margin: 0;
      }
    }

    .card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;

      h3 {
        color: #0056b3;
        margin-top: 0;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
      }

      input, textarea, select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #0056b3;
        }
      }
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
      }

      tr:hover {
        background: #f8f9fa;
      }
    }

    .role-select, .status-select {
      padding: 0.5rem;
      margin-right: 0.5rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
    }

    .jobs-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
      }
    }

    .job-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;

      &.badge-success {
        background: #d4edda;
        color: #28a745;
      }

      &.badge-secondary {
        background: #e2e3e5;
        color: #6c757d;
      }

      &.badge-warning {
        background: #fff3cd;
        color: #856404;
      }

      &.badge-info {
        background: #d1ecf1;
        color: #0c5460;
      }

      &.badge-danger {
        background: #f8d7da;
        color: #721c24;
      }
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &.btn-primary {
        background: #0056b3;
        color: white;

        &:hover:not(:disabled) {
          background: #004494;
        }
      }

      &.btn-secondary {
        background: #6c757d;
        color: white;

        &:hover {
          background: #5a6268;
        }
      }

      &.btn-danger {
        background: #dc3545;
        color: white;

        &:hover {
          background: #c82333;
        }
      }

      &.btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }

    .empty-message {
      text-align: center;
      color: #6c757d;
      padding: 2rem;
      font-size: 1.1rem;
    }
  `]
})
export class HRDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  currentUser = signal(this.authService.currentUserValue);
  stats = signal<HRDashboardStats | null>(null);
  pendingUsers = signal<(User & { selectedRole?: string })[]>([]);
  jobOffers = signal<JobOffer[]>([]);
  recommendedCandidates = signal<CandidateRecommendation[]>([]);
  applications = signal<(JobApplication & { newStatus?: string })[]>([]);
  
  activeTab = signal<string>('pending-users');
  showCreateJobOffer = false;
  selectedJobOfferId = signal<number | null>(null);
  selectedJobOfferTitle = signal<string>('');

  tabs = [
    { id: 'pending-users', label: 'Usuarios Pendientes' },
    { id: 'job-offers', label: 'Ofertas de Trabajo' },
    { id: 'candidates', label: 'Candidatos Recomendados' },
    { id: 'applications', label: 'Aplicaciones' }
  ];

  newJobOffer: Partial<JobOffer> = {
    title: '',
    description: '',
    requirements: '',
    department: '',
    minYearsExperience: 0,
    minPerformanceScore: 0
  };

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadPendingUsers();
    this.loadJobOffers();
  }

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  loadDashboardStats(): void {
    this.apiService.getHRDashboardStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  loadPendingUsers(): void {
    console.log('=== LLAMANDO getPendingUsers ===');
    this.apiService.getPendingUsers().subscribe({
      next: (users) => {
        console.log('=== RESPUESTA RECIBIDA ===', users);
        console.log('Cantidad:', users.length);
        this.pendingUsers.set(users.map(u => ({ ...u, selectedRole: '' })));
      },
      error: (error) => {
        console.error('=== ERROR ===', error);
        console.error('Status:', error.status);
      }
    });
  }

  loadJobOffers(): void {
    this.apiService.getJobOffers().subscribe({
      next: (jobs) => this.jobOffers.set(jobs),
      error: (error) => console.error('Error loading job offers:', error)
    });
  }

  approveUser(user: User & { selectedRole?: string }): void {
    if (!user.selectedRole) return;

    this.apiService.approveUser(user.id, user.selectedRole).subscribe({
      next: () => {
        this.loadPendingUsers();
        this.loadDashboardStats();
        alert(`Usuario ${user.fullName} aprobado como ${user.selectedRole}`);
      },
      error: (error) => {
        console.error('Error approving user:', error);
        alert('Error al aprobar usuario');
      }
    });
  }

  createJobOffer(): void {
    if (!this.newJobOffer.title || !this.newJobOffer.description) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.apiService.createJobOffer(this.newJobOffer).subscribe({
      next: () => {
        this.loadJobOffers();
        this.loadDashboardStats();
        this.showCreateJobOffer = false;
        this.newJobOffer = {
          title: '',
          description: '',
          requirements: '',
          department: '',
          minYearsExperience: 0,
          minPerformanceScore: 0
        };
        alert('Oferta creada exitosamente');
      },
      error: (error) => {
        console.error('Error creating job offer:', error);
        alert('Error al crear oferta');
      }
    });
  }

  viewRecommendedCandidates(jobOfferId: number): void {
    const job = this.jobOffers().find(j => j.id === jobOfferId);
    if (job) {
      this.selectedJobOfferId.set(jobOfferId);
      this.selectedJobOfferTitle.set(job.title);
      
      this.apiService.getRecommendedCandidates(jobOfferId).subscribe({
        next: (candidates) => {
          this.recommendedCandidates.set(candidates);
          this.setActiveTab('candidates');
        },
        error: (error) => console.error('Error loading candidates:', error)
      });
    }
  }

  viewApplications(jobOfferId: number): void {
    const job = this.jobOffers().find(j => j.id === jobOfferId);
    if (job) {
      this.selectedJobOfferId.set(jobOfferId);
      this.selectedJobOfferTitle.set(job.title);
      
      this.apiService.getJobApplications(jobOfferId).subscribe({
        next: (apps) => {
          this.applications.set(apps.map(a => ({ ...a, newStatus: a.status })));
          this.setActiveTab('applications');
        },
        error: (error) => console.error('Error loading applications:', error)
      });
    }
  }

  updateApplicationStatus(app: JobApplication & { newStatus?: string }): void {
    if (!app.newStatus) return;

    this.apiService.updateApplicationStatus(app.id, app.newStatus, app.hrNotes).subscribe({
      next: () => {
        if (this.selectedJobOfferId()) {
          this.viewApplications(this.selectedJobOfferId()!);
        }
        alert('Estado de aplicación actualizado');
      },
      error: (error) => {
        console.error('Error updating application:', error);
        alert('Error al actualizar aplicación');
      }
    });
  }

  closeJobOffer(jobOfferId: number): void {
    if (confirm('¿Estás seguro de cerrar esta oferta?')) {
      this.apiService.closeJobOffer(jobOfferId).subscribe({
        next: () => {
          this.loadJobOffers();
          this.loadDashboardStats();
          alert('Oferta cerrada exitosamente');
        },
        error: (error) => {
          console.error('Error closing job offer:', error);
          alert('Error al cerrar oferta');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
