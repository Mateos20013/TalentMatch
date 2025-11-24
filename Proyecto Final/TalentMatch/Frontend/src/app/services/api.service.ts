import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User,
  JobOffer,
  JobApplication,
  Objective,
  ObjectiveProgress,
  Certificate,
  Achievement,
  PerformanceReview,
  CandidateRecommendation,
  HRDashboardStats
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // HR Endpoints
  getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/hr/pending-users`);
  }

  approveUser(userId: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/hr/approve-user`, { userId, role });
  }

  getHRDashboardStats(): Observable<HRDashboardStats> {
    return this.http.get<HRDashboardStats>(`${this.apiUrl}/api/hr/stats`);
  }

  createJobOffer(jobOffer: Partial<JobOffer>): Observable<JobOffer> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.post<JobOffer>(
      `${this.apiUrl}/api/hr/create-job-offer`,
      { ...jobOffer, createdByEmail: user.email }
    );
  }

  getJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/api/hr/job-offers`);
  }

  getRecommendedCandidates(jobOfferId: number): Observable<CandidateRecommendation[]> {
    return this.http.get<CandidateRecommendation[]>(
      `${this.apiUrl}/api/hr/recommended-candidates/${jobOfferId}`
    );
  }

  getJobApplications(jobOfferId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(
      `${this.apiUrl}/api/hr/job-applications/${jobOfferId}`
    );
  }

  updateApplicationStatus(applicationId: number, status: string, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/hr/update-application-status`, {
      applicationId,
      status,
      notes
    });
  }

  closeJobOffer(jobOfferId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/hr/close-job-offer/${jobOfferId}`, {});
  }

  // Supervisor Endpoints
  getEmployeesForReview(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/supervisor/employees`);
  }

  createPerformanceReview(review: Partial<PerformanceReview>): Observable<PerformanceReview> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.post<PerformanceReview>(
      `${this.apiUrl}/api/supervisor/create-review`,
      { ...review, reviewerEmail: user.email }
    );
  }

  getMyReviews(): Observable<any[]> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.get<any[]>(`${this.apiUrl}/api/supervisor/my-reviews?email=${user.email}`);
  }

  getAllEmployeeObjectives(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/supervisor/employee-objectives`);
  }

  commentOnObjective(objectiveId: number, comment: string, completionPercentage: number): Observable<any> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.post(`${this.apiUrl}/api/supervisor/comment-objective`, {
      objectiveId,
      supervisorEmail: user.email,
      comment,
      completionPercentage
    });
  }

  // Employee Endpoints
  getMyProfile(): Observable<User> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.get<User>(`${this.apiUrl}/api/employee/profile?email=${user.email}`);
  }

  updateProfile(profile: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/employee/update-profile`, profile);
  }

  getMyObjectives(): Observable<any[]> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.get<any[]>(`${this.apiUrl}/api/employee/objectives?email=${user.email}`);
  }

  createObjective(objective: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/employee/create-objective`, objective);
  }

  updateObjectiveProgress(progress: Partial<ObjectiveProgress>): Observable<ObjectiveProgress> {
    return this.http.post<ObjectiveProgress>(
      `${this.apiUrl}/Employee/UpdateObjectiveProgress`,
      progress
    );
  }

  getMyCertificates(): Observable<Certificate[]> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.get<Certificate[]>(`${this.apiUrl}/api/employee/certificates?email=${user.email}`);
  }

  createCertificate(formData: FormData): Observable<Certificate> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.post<Certificate>(`${this.apiUrl}/api/employee/create-certificate?email=${user.email}`, formData);
  }

  getMyAchievements(): Observable<Achievement[]> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.get<Achievement[]>(`${this.apiUrl}/api/employee/achievements?email=${user.email}`);
  }

  createAchievement(achievement: Partial<Achievement>): Observable<Achievement> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.post<Achievement>(
      `${this.apiUrl}/api/employee/create-achievement`,
      { ...achievement, email: user.email }
    );
  }

  getAvailableJobOffers(): Observable<any[]> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.get<any[]>(`${this.apiUrl}/api/employee/job-offers?email=${user.email}`);
  }

  applyToJob(jobOfferId: number): Observable<any> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.http.post(
      `${this.apiUrl}/api/employee/apply-to-job/${jobOfferId}`,
      { email: user.email }
    );
  }

  getMyApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/api/employee/applications`);
  }

  getMyPerformanceReviews(): Observable<PerformanceReview[]> {
    return this.http.get<PerformanceReview[]>(`${this.apiUrl}/api/employee/reviews`);
  }
}
