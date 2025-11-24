import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { User, Objective, Certificate, Achievement, JobOffer, JobApplication, PerformanceReview, ObjectiveStatus } from '../models';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Panel de Empleado</h1>
        <div class="header-actions">
          <span>Bienvenido, {{ currentUser()?.fullName }}</span>
          <button class="btn btn-secondary" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>

      <div class="tabs">
        <button *ngFor="let tab of tabs" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
          {{ tab.label }}
        </button>
      </div>

      <!-- Profile Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'profile'">
        <h2>Mi Perfil</h2>
        <div class="card">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" [(ngModel)]="profile.fullName" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Posición</label>
              <input type="text" [(ngModel)]="profile.position" />
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <input type="text" [(ngModel)]="profile.department" />
            </div>
          </div>
          <div class="form-group">
            <label>Años de Experiencia</label>
            <input type="number" [(ngModel)]="profile.yearsOfExperience" min="0" />
          </div>
          <button class="btn btn-primary" (click)="updateProfile()">Actualizar Perfil</button>
        </div>
      </div>

      <!-- Objectives Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'objectives'">
        <div class="section-header">
          <h2>Mis Objetivos</h2>
          <button class="btn btn-primary" (click)="showCreateObjective = !showCreateObjective">
            {{ showCreateObjective ? 'Cancelar' : '+ Nuevo Objetivo' }}
          </button>
        </div>

        <div class="card" *ngIf="showCreateObjective">
          <h3>Crear Nuevo Objetivo</h3>
          <form (ngSubmit)="createObjective()">
            <div class="form-group">
              <label>Título *</label>
              <input type="text" [(ngModel)]="newObjective.title" name="title" required />
            </div>
            <div class="form-group">
              <label>Descripción *</label>
              <textarea [(ngModel)]="newObjective.description" name="description" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>Fecha Límite *</label>
              <input type="datetime-local" [(ngModel)]="newObjective.deadline" name="deadline" required />
            </div>
            <button type="submit" class="btn btn-primary">Crear Objetivo</button>
          </form>
        </div>

        <div class="objectives-grid">
          <div class="card" *ngFor="let obj of objectives()">
            <h3>{{ obj.title }}</h3>
            <p>{{ obj.description }}</p>
            <p><strong>Fecha Límite:</strong> {{ obj.deadline | date:'short' }}</p>
            <p><strong>Estado:</strong> <span class="badge">{{ obj.status }}</span></p>
            
            <div class="progress-form">
              <h4>Registrar Progreso</h4>
              <input type="text" [(ngModel)]="obj.newProgressDesc" placeholder="Descripción del progreso..." />
              <input type="number" [(ngModel)]="obj.newProgressPercent" placeholder="% Completado" min="0" max="100" />
              <button class="btn btn-sm btn-primary" (click)="addProgress(obj)">Agregar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Certificates Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'certificates'">
        <div class="section-header">
          <h2>Mis Certificados</h2>
          <button class="btn btn-primary" (click)="showCreateCertificate = !showCreateCertificate">
            {{ showCreateCertificate ? 'Cancelar' : '+ Nuevo Certificado' }}
          </button>
        </div>

        <div class="card" *ngIf="showCreateCertificate">
          <h3>Agregar Certificado</h3>
          <form (ngSubmit)="createCertificate()">
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" [(ngModel)]="newCertificate.name" name="name" required />
            </div>
            <div class="form-group">
              <label>Organización Emisora *</label>
              <input type="text" [(ngModel)]="newCertificate.issuingOrganization" name="org" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha de Emisión *</label>
                <input type="date" [(ngModel)]="newCertificate.issueDate" name="issue" required />
              </div>
              <div class="form-group">
                <label>Fecha de Expiración</label>
                <input type="date" [(ngModel)]="newCertificate.expiryDate" name="expiry" />
              </div>
            </div>
            <div class="form-group">
              <label>Archivo (opcional)</label>
              <input type="file" (change)="onCertificateFileSelected($event)" accept=".pdf,.jpg,.png" />
            </div>
            <button type="submit" class="btn btn-primary">Agregar Certificado</button>
          </form>
        </div>

        <div class="certificates-grid">
          <div class="card" *ngFor="let cert of certificates()">
            <h3>{{ cert.name }}</h3>
            <p><strong>Organización:</strong> {{ cert.issuingOrganization }}</p>
            <p><strong>Emisión:</strong> {{ cert.issueDate | date }}</p>
            <p *ngIf="cert.expiryDate"><strong>Expiración:</strong> {{ cert.expiryDate | date }}</p>
            <a *ngIf="cert.fileUrl" [href]="cert.fileUrl" target="_blank" class="btn btn-sm btn-secondary">Ver Archivo</a>
          </div>
        </div>
      </div>

      <!-- Achievements Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'achievements'">
        <div class="section-header">
          <h2>Mis Logros</h2>
          <button class="btn btn-primary" (click)="showCreateAchievement = !showCreateAchievement">
            {{ showCreateAchievement ? 'Cancelar' : '+ Nuevo Logro' }}
          </button>
        </div>

        <div class="card" *ngIf="showCreateAchievement">
          <h3>Registrar Logro</h3>
          <form (ngSubmit)="createAchievement()">
            <div class="form-group">
              <label>Título *</label>
              <input type="text" [(ngModel)]="newAchievement.title" name="title" required />
            </div>
            <div class="form-group">
              <label>Descripción *</label>
              <textarea [(ngModel)]="newAchievement.description" name="description" rows="3" required></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha *</label>
                <input type="date" [(ngModel)]="newAchievement.date" name="date" required />
              </div>
              <div class="form-group">
                <label>Impacto (1-10) *</label>
                <input type="number" [(ngModel)]="newAchievement.impactScore" name="impact" min="1" max="10" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Registrar Logro</button>
          </form>
        </div>

        <div class="achievements-grid">
          <div class="card" *ngFor="let ach of achievements()">
            <h3>{{ ach.title }}</h3>
            <p>{{ ach.description }}</p>
            <p><strong>Fecha:</strong> {{ ach.date | date }}</p>
            <p><strong>Impacto:</strong> {{ ach.impactScore }}/10</p>
          </div>
        </div>
      </div>

      <!-- Job Offers Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'job-offers'">
        <h2>Ofertas de Trabajo Disponibles</h2>
        <div class="jobs-grid">
          <div class="card" *ngFor="let job of availableJobs()">
            <h3>{{ job.title }}</h3>
            <p><strong>Departamento:</strong> {{ job.department }}</p>
            <p>{{ job.description }}</p>
            <p><strong>Requisitos:</strong> {{ job.requirements }}</p>
            <p><strong>Experiencia mínima:</strong> {{ job.minYearsExperience }} años</p>
            <button class="btn btn-primary" (click)="applyToJob(job.id)">Aplicar</button>
          </div>
        </div>
      </div>

      <!-- My Applications Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'my-applications'">
        <h2>Mis Aplicaciones</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Oferta</th>
                <th>Fecha</th>
                <th>Match Score</th>
                <th>Estado</th>
                <th>Notas HR</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of myApplications()">
                <td>{{ app.jobOffer?.title }}</td>
                <td>{{ app.applicationDate | date:'short' }}</td>
                <td><strong>{{ app.matchScore.toFixed(2) }}</strong></td>
                <td><span class="badge">{{ app.status }}</span></td>
                <td>{{ app.hrNotes || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'reviews'">
        <h2>Mis Evaluaciones de Desempeño</h2>
        <div class="reviews-grid">
          <div class="card" *ngFor="let review of reviews()">
            <h3>Evaluación - {{ review.reviewDate | date }}</h3>
            <p><strong>Supervisor:</strong> {{ review.supervisor?.fullName }}</p>
            <div class="scores-grid">
              <div><strong>Técnicas:</strong> {{ review.technicalSkills }}/10</div>
              <div><strong>Comunicación:</strong> {{ review.communication }}/10</div>
              <div><strong>Trabajo en Equipo:</strong> {{ review.teamwork }}/10</div>
              <div><strong>Resolución Problemas:</strong> {{ review.problemSolving }}/10</div>
              <div><strong>Productividad:</strong> {{ review.productivity }}/10</div>
              <div><strong>Liderazgo:</strong> {{ review.leadership }}/10</div>
            </div>
            <p><strong>Score General:</strong> {{ review.overallScore.toFixed(2) }}/10</p>
            <p *ngIf="review.comments"><strong>Comentarios:</strong> {{ review.comments }}</p>
          </div>
        </div>
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
      }

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;

      button {
        padding: 0.75rem 1.25rem;
        background: white;
        border: 2px solid #e0e0e0;
        color: #6c757d;
        font-weight: 600;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;

        &.active {
          color: #0056b3;
          border-color: #0056b3;
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
        margin-bottom: 0.5rem;
      }

      input, textarea, select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e0e0e0;
        border-radius: 6px;

        &:focus {
          outline: none;
          border-color: #0056b3;
        }
      }
    }

    .objectives-grid, .certificates-grid, .achievements-grid, .jobs-grid, .reviews-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .progress-form {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;

      h4 {
        margin-top: 0;
      }

      input {
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
      }
    }

    .scores-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      margin: 1rem 0;
      padding: 1rem;
      background: white;
      border-radius: 6px;
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
      }
    }

    .badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      background: #d1ecf1;
      color: #0c5460;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;

      &.btn-primary {
        background: #0056b3;
        color: white;

        &:hover {
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

      &.btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  currentUser = signal(this.authService.currentUserValue);
  profile: Partial<User> = {};
  objectives = signal<(Objective & { newProgressDesc?: string, newProgressPercent?: number })[]>([]);
  certificates = signal<Certificate[]>([]);
  achievements = signal<Achievement[]>([]);
  availableJobs = signal<JobOffer[]>([]);
  myApplications = signal<JobApplication[]>([]);
  reviews = signal<PerformanceReview[]>([]);
  
  activeTab = signal('profile');
  showCreateObjective = false;
  showCreateCertificate = false;
  showCreateAchievement = false;
  selectedCertificateFile: File | null = null;

  tabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'objectives', label: 'Objetivos' },
    { id: 'certificates', label: 'Certificados' },
    { id: 'achievements', label: 'Logros' },
    { id: 'job-offers', label: 'Ofertas Disponibles' },
    { id: 'my-applications', label: 'Mis Aplicaciones' },
    { id: 'reviews', label: 'Evaluaciones' }
  ];

  newObjective: Partial<Objective> = { title: '', description: '', deadline: new Date(), status: ObjectiveStatus.Pending };
  newCertificate: Partial<Certificate> = { name: '', issuingOrganization: '', issueDate: new Date() };
  newAchievement: Partial<Achievement> = { title: '', description: '', date: new Date(), impactScore: 1 };

  ngOnInit(): void {
    this.loadProfile();
    this.loadObjectives();
    this.loadCertificates();
    this.loadAchievements();
    this.loadAvailableJobs();
    this.loadMyApplications();
    this.loadReviews();
  }

  loadProfile(): void {
    this.apiService.getMyProfile().subscribe({
      next: (profile) => this.profile = { ...profile },
      error: (error) => console.error('Error loading profile:', error)
    });
  }

  updateProfile(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      alert('Usuario no autenticado');
      return;
    }

    const profileData = {
      ...this.profile,
      email: user.email
    };

    this.apiService.updateProfile(profileData).subscribe({
      next: () => alert('Perfil actualizado'),
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Error al actualizar perfil');
      }
    });
  }

  loadObjectives(): void {
    this.apiService.getMyObjectives().subscribe({
      next: (objs) => this.objectives.set(objs),
      error: (error) => console.error('Error loading objectives:', error)
    });
  }

  createObjective(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      alert('Usuario no autenticado');
      return;
    }

    const objectiveData = {
      email: user.email,
      title: this.newObjective.title,
      description: this.newObjective.description,
      deadline: this.newObjective.deadline instanceof Date 
        ? this.newObjective.deadline.toISOString() 
        : new Date().toISOString()
    };

    this.apiService.createObjective(objectiveData).subscribe({
      next: () => {
        this.loadObjectives();
        this.showCreateObjective = false;
        this.newObjective = { title: '', description: '', deadline: new Date(), status: ObjectiveStatus.Pending };
        alert('Objetivo creado');
      },
      error: (error) => {
        console.error('Error creating objective:', error);
        alert('Error al crear objetivo');
      }
    });
  }

  addProgress(obj: Objective & { newProgressDesc?: string, newProgressPercent?: number }): void {
    if (!obj.newProgressDesc || obj.newProgressPercent === undefined) return;

    this.apiService.updateObjectiveProgress({
      objectiveId: obj.id,
      description: obj.newProgressDesc,
      completionPercentage: obj.newProgressPercent,
      date: new Date()
    }).subscribe({
      next: () => {
        this.loadObjectives();
        alert('Progreso registrado');
      },
      error: (error) => {
        console.error('Error adding progress:', error);
        alert('Error al registrar progreso');
      }
    });
  }

  loadCertificates(): void {
    this.apiService.getMyCertificates().subscribe({
      next: (certs) => this.certificates.set(certs),
      error: (error) => console.error('Error loading certificates:', error)
    });
  }

  onCertificateFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCertificateFile = file;
    }
  }

  createCertificate(): void {
    const formData = new FormData();
    formData.append('name', this.newCertificate.name || '');
    formData.append('issuingOrganization', this.newCertificate.issuingOrganization || '');
    formData.append('issueDate', this.newCertificate.issueDate?.toString() || '');
    if (this.newCertificate.expiryDate) {
      formData.append('expiryDate', this.newCertificate.expiryDate.toString());
    }
    if (this.selectedCertificateFile) {
      formData.append('file', this.selectedCertificateFile);
    }

    this.apiService.createCertificate(formData).subscribe({
      next: () => {
        this.loadCertificates();
        this.showCreateCertificate = false;
        this.newCertificate = { name: '', issuingOrganization: '', issueDate: new Date() };
        this.selectedCertificateFile = null;
        alert('Certificado agregado');
      },
      error: (error) => {
        console.error('Error creating certificate:', error);
        alert('Error al agregar certificado');
      }
    });
  }

  loadAchievements(): void {
    this.apiService.getMyAchievements().subscribe({
      next: (achs) => this.achievements.set(achs),
      error: (error) => console.error('Error loading achievements:', error)
    });
  }

  createAchievement(): void {
    this.apiService.createAchievement(this.newAchievement).subscribe({
      next: () => {
        this.loadAchievements();
        this.showCreateAchievement = false;
        this.newAchievement = { title: '', description: '', date: new Date(), impactScore: 1 };
        alert('Logro registrado');
      },
      error: (error) => {
        console.error('Error creating achievement:', error);
        alert('Error al registrar logro');
      }
    });
  }

  loadAvailableJobs(): void {
    this.apiService.getAvailableJobOffers().subscribe({
      next: (jobs) => this.availableJobs.set(jobs),
      error: (error) => console.error('Error loading job offers:', error)
    });
  }

  applyToJob(jobId: number): void {
    this.apiService.applyToJob(jobId).subscribe({
      next: () => {
        this.loadAvailableJobs();
        this.loadMyApplications();
        alert('Aplicación enviada exitosamente');
      },
      error: (error) => {
        console.error('Error applying to job:', error);
        alert('Error al aplicar a la oferta');
      }
    });
  }

  loadMyApplications(): void {
    this.apiService.getMyApplications().subscribe({
      next: (apps) => this.myApplications.set(apps),
      error: (error) => console.error('Error loading applications:', error)
    });
  }

  loadReviews(): void {
    this.apiService.getMyPerformanceReviews().subscribe({
      next: (revs) => this.reviews.set(revs),
      error: (error) => console.error('Error loading reviews:', error)
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
