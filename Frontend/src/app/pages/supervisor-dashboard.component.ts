import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { User, Objective, PerformanceReview, ObjectiveProgress } from '../models';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Panel de Supervisor</h1>
        <div class="header-actions">
          <span>Bienvenido, {{ currentUser()?.fullName }}</span>
          <button class="btn btn-secondary" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>

      <div class="tabs">
        <button [class.active]="activeTab() === 'reviews'" (click)="activeTab.set('reviews')">
          Evaluaciones de Desempeño
        </button>
        <button [class.active]="activeTab() === 'history'" (click)="activeTab.set('history'); loadMyReviews()">
          Historial de Evaluaciones
        </button>
        <button [class.active]="activeTab() === 'objectives'" (click)="activeTab.set('objectives'); loadAllObjectives()">
          Objetivos de Empleados
        </button>
      </div>

      <!-- Reviews Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'reviews'">
        <div class="section-header">
          <h2>Evaluaciones de Desempeño</h2>
          <button class="btn btn-primary" (click)="showCreateReview = !showCreateReview">
            {{ showCreateReview ? 'Cancelar' : '+ Nueva Evaluación' }}
          </button>
        </div>

        <div class="card" *ngIf="showCreateReview">
          <h3>Crear Nueva Evaluación</h3>
          <form (ngSubmit)="createReview()">
            <div class="form-group">
              <label>Empleado *</label>
              <select [(ngModel)]="newReview.employeeId" name="employee" required>
                <option value="">Seleccionar empleado</option>
                <option *ngFor="let emp of employees()" [value]="emp.id">{{ emp.fullName }}</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Habilidades Técnicas (1-10) *</label>
                <input type="number" [(ngModel)]="newReview.technicalSkills" name="technical" min="1" max="10" required />
              </div>
              <div class="form-group">
                <label>Comunicación (1-10) *</label>
                <input type="number" [(ngModel)]="newReview.communication" name="communication" min="1" max="10" required />
              </div>
              <div class="form-group">
                <label>Trabajo en Equipo (1-10) *</label>
                <input type="number" [(ngModel)]="newReview.teamwork" name="teamwork" min="1" max="10" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Resolución de Problemas (1-10) *</label>
                <input type="number" [(ngModel)]="newReview.problemSolving" name="problem" min="1" max="10" required />
              </div>
              <div class="form-group">
                <label>Productividad (1-10) *</label>
                <input type="number" [(ngModel)]="newReview.productivity" name="productivity" min="1" max="10" required />
              </div>
              <div class="form-group">
                <label>Liderazgo (1-10) *</label>
                <input type="number" [(ngModel)]="newReview.leadership" name="leadership" min="1" max="10" required />
              </div>
            </div>
            <div class="form-group">
              <label>Comentarios</label>
              <textarea [(ngModel)]="newReview.comments" name="comments" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Crear Evaluación</button>
          </form>
        </div>
      </div>

      <!-- History Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'history'">
        <h2>Historial de Evaluaciones</h2>
        <div class="reviews-list" *ngIf="myReviews().length > 0">
          <div class="card review-card" *ngFor="let review of myReviews()">
            <div class="review-header">
              <h3>{{ review.employeeName }}</h3>
              <span class="score-badge">{{ review.overallScore | number:'1.1-1' }}/10</span>
            </div>
            <p><strong>Fecha:</strong> {{ review.reviewDate | date:'medium' }}</p>
            <div class="ratings-grid">
              <div class="rating-item">
                <span class="label">Habilidades Técnicas:</span>
                <span class="value">{{ review.technicalSkillsRating }}/5</span>
              </div>
              <div class="rating-item">
                <span class="label">Trabajo en Equipo:</span>
                <span class="value">{{ review.teamworkRating }}/5</span>
              </div>
              <div class="rating-item">
                <span class="label">Liderazgo:</span>
                <span class="value">{{ review.leadershipRating }}/5</span>
              </div>
              <div class="rating-item">
                <span class="label">Comunicación:</span>
                <span class="value">{{ review.communicationRating }}/5</span>
              </div>
              <div class="rating-item">
                <span class="label">Iniciativa:</span>
                <span class="value">{{ review.initiativeRating }}/5</span>
              </div>
              <div class="rating-item">
                <span class="label">Productividad:</span>
                <span class="value">{{ review.productivityRating }}/5</span>
              </div>
            </div>
            <div class="comments-section" *ngIf="review.supervisorComments">
              <strong>Comentarios:</strong>
              <p>{{ review.supervisorComments }}</p>
            </div>
            <div class="comments-section" *ngIf="review.strengths">
              <strong>Fortalezas:</strong>
              <p>{{ review.strengths }}</p>
            </div>
            <div class="comments-section" *ngIf="review.areasForImprovement">
              <strong>Áreas de Mejora:</strong>
              <p>{{ review.areasForImprovement }}</p>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="myReviews().length === 0">
          <p>No has creado evaluaciones aún</p>
        </div>
      </div>

      <!-- Objectives Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'objectives'">
        <h2>Objetivos de Empleados</h2>
        
        <div class="objectives-list" *ngIf="allObjectives().length > 0">
          <div class="card objective-card" *ngFor="let obj of allObjectives()">
            <div class="objective-header">
              <div>
                <h3>{{ obj.title }}</h3>
                <p class="employee-info">👤 {{ obj.employeeName }} ({{ obj.employeeEmail }})</p>
              </div>
              <span class="status-badge" [class]="obj.status.toLowerCase()">{{ obj.status }}</span>
            </div>
            
            <p class="description">{{ obj.description }}</p>
            
            <div class="objective-meta">
              <div class="meta-item">
                <strong>Fecha Objetivo:</strong> {{ obj.targetDate | date:'short' }}
              </div>
              <div class="meta-item">
                <strong>Progreso:</strong> {{ obj.completionPercentage }}%
              </div>
              <div class="meta-item">
                <strong>Actualizaciones:</strong> {{ obj.progressCount }}
              </div>
            </div>

            <div class="comment-section">
              <h4>Agregar Comentario del Supervisor</h4>
              <textarea 
                [(ngModel)]="obj.newComment" 
                placeholder="Escribe tu comentario sobre este objetivo..."
                rows="2"></textarea>
              <div class="comment-actions">
                <div class="form-group inline">
                  <label>Progreso Actualizado (%):</label>
                  <input 
                    type="number" 
                    [(ngModel)]="obj.newProgress" 
                    min="0" 
                    max="100" 
                    placeholder="0-100" />
                </div>
                <button 
                  class="btn btn-primary" 
                  (click)="commentOnObjective(obj)"
                  [disabled]="!obj.newComment || obj.newProgress === undefined">
                  Enviar Comentario
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="allObjectives().length === 0">
          <p>No hay objetivos de empleados disponibles</p>
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

      button {
        padding: 0.875rem 1.5rem;
        background: white;
        border: 2px solid #e0e0e0;
        color: #6c757d;
        font-weight: 600;
        cursor: pointer;
        border-radius: 8px 8px 0 0;

        &.active {
          color: #0056b3;
          border-color: #0056b3;
          background: white;
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

    .objectives-list {
      display: grid;
      gap: 1.5rem;
    }

    .progress-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .progress-item {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .supervisor-comment {
      background: #d1ecf1;
      padding: 0.75rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      background: #d1ecf1;
      color: #0c5460;
      font-weight: 600;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.875rem;

      &.inprogress {
        background: #fff3cd;
        color: #856404;
      }

      &.completed {
        background: #d4edda;
        color: #155724;
      }

      &.notstarted {
        background: #f8d7da;
        color: #721c24;
      }

      &.cancelled {
        background: #e2e3e5;
        color: #383d41;
      }
    }

    .score-badge {
      background: #0056b3;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 700;
      font-size: 1.125rem;
    }

    .review-card, .objective-card {
      background: white;
      border: 2px solid #e0e0e0;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .review-header, .objective-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
        color: #0056b3;
      }
    }

    .ratings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .rating-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;

      .label {
        color: #6c757d;
      }

      .value {
        font-weight: 700;
        color: #0056b3;
      }
    }

    .comments-section {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-left: 4px solid #0056b3;
      border-radius: 4px;

      strong {
        color: #0056b3;
        display: block;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
        color: #495057;
      }
    }

    .employee-info {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0.5rem 0 0 0;
    }

    .description {
      color: #495057;
      margin: 1rem 0;
    }

    .objective-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 1rem;

      .meta-item {
        strong {
          display: block;
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
      }
    }

    .comment-section {
      background: #e7f3ff;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 1.5rem;

      h4 {
        color: #0056b3;
        margin-top: 0;
        margin-bottom: 1rem;
      }

      textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #0056b3;
        border-radius: 6px;
        margin-bottom: 1rem;
        resize: vertical;

        &:focus {
          outline: none;
          border-color: #004494;
        }
      }
    }

    .comment-actions {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;

      .form-group.inline {
        flex: 1;
        margin: 0;

        label {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        input {
          width: 100px;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6c757d;

      p {
        font-size: 1.125rem;
      }
    }

    .reviews-list {
      display: grid;
      gap: 1.5rem;
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
export class SupervisorDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  currentUser = signal(this.authService.currentUserValue);
  employees = signal<User[]>([]);
  objectives = signal<(Objective & { progress?: (ObjectiveProgress & { newComment?: string })[] })[]>([]);
  myReviews = signal<any[]>([]);
  allObjectives = signal<any[]>([]);
  activeTab = signal<string>('reviews');
  showCreateReview = false;
  selectedEmployeeId = '';

  newReview: Partial<PerformanceReview> = {
    employeeId: '',
    technicalSkills: 1,
    communication: 1,
    teamwork: 1,
    problemSolving: 1,
    productivity: 1,
    leadership: 1,
    comments: ''
  };

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.apiService.getEmployeesForReview().subscribe({
      next: (emps) => {
        console.log('Employees loaded:', emps);
        this.employees.set(emps);
      },
      error: (error) => console.error('Error loading employees:', error)
    });
  }

  createReview(): void {
    this.apiService.createPerformanceReview(this.newReview).subscribe({
      next: () => {
        alert('Evaluación creada exitosamente');
        this.showCreateReview = false;
        this.newReview = { employeeId: '', technicalSkills: 1, communication: 1, teamwork: 1, problemSolving: 1, productivity: 1, leadership: 1, comments: '' };
        this.loadMyReviews();
      },
      error: (error: any) => {
        console.error('Error creating review:', error);
        alert('Error al crear evaluación');
      }
    });
  }

  loadMyReviews(): void {
    this.apiService.getMyReviews().subscribe({
      next: (reviews) => {
        console.log('My reviews loaded:', reviews);
        this.myReviews.set(reviews);
      },
      error: (error: any) => console.error('Error loading my reviews:', error)
    });
  }

  loadAllObjectives(): void {
    this.apiService.getAllEmployeeObjectives().subscribe({
      next: (objectives) => {
        console.log('All objectives loaded:', objectives);
        this.allObjectives.set(objectives.map(obj => ({
          ...obj,
          newComment: '',
          newProgress: obj.completionPercentage || 0
        })));
      },
      error: (error: any) => console.error('Error loading objectives:', error)
    });
  }

  commentOnObjective(objective: any): void {
    if (!objective.newComment || objective.newProgress === undefined) return;

    this.apiService.commentOnObjective(
      objective.id,
      objective.newComment,
      objective.newProgress
    ).subscribe({
      next: (response) => {
        console.log('Comment added:', response);
        alert('Comentario agregado exitosamente');
        objective.newComment = '';
        this.loadAllObjectives();
      },
      error: (error: any) => {
        console.error('Error commenting on objective:', error);
        alert('Error al agregar comentario');
      }
    });
  }

  loadEmployeeObjectives(): void {
    if (!this.selectedEmployeeId) return;
    
    this.apiService.getAllEmployeeObjectives().subscribe({
      next: (objs: any) => this.objectives.set(objs),
      error: (error: any) => console.error('Error loading objectives:', error)
    });
  }

  addComment(progress: any): void {
    if (!progress.newComment) return;

    alert('Función obsoleta - usar la nueva pestaña de Objetivos');
  }

  logout(): void {
    this.authService.logout();
  }
}
