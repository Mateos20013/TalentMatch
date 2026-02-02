// Enums
export enum ObjectiveStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum JobOfferStatus {
  Open = 'Open',
  Closed = 'Closed',
  Cancelled = 'Cancelled'
}

export enum ApplicationStatus {
  Pending = 'Pending',
  UnderReview = 'UnderReview',
  Accepted = 'Accepted',
  Rejected = 'Rejected'
}

// User Models
export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  position?: string;
  department?: string;
  yearsOfExperience: number;
  isApproved: boolean;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  position?: string;
  department?: string;
  hireDate: string;
}

export interface LoginResponse {
  user: User;
  role: string;
}

// Objective Models
export interface Objective {
  id: number;
  title: string;
  description: string;
  deadline: Date;
  status: ObjectiveStatus;
  userId: string;
  user?: User;
  progress: ObjectiveProgress[];
}

export interface ObjectiveProgress {
  id: number;
  objectiveId: number;
  date: Date;
  description: string;
  completionPercentage: number;
  supervisorComment?: string;
  supervisorId?: string;
  supervisor?: User;
}

// Certificate Model
export interface Certificate {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  fileUrl?: string;
  userId: string;
  user?: User;
}

// Achievement Model
export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: Date;
  impactScore: number;
  userId: string;
  user?: User;
}

// Performance Review Model
export interface PerformanceReview {
  id: number;
  employeeId: string;
  supervisorId: string;
  reviewDate: Date;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  problemSolving: number;
  productivity: number;
  leadership: number;
  overallScore: number;
  comments?: string;
  employee?: User;
  supervisor?: User;
}

// Job Offer Models
export interface JobOffer {
  id: number;
  title: string;
  description: string;
  requirements: string;
  department: string;
  minYearsExperience: number;
  minPerformanceScore: number;
  status: JobOfferStatus;
  createdDate: Date;
  closedDate?: Date;
  createdById: string;
  createdBy?: User;
  applications: JobApplication[];
}

export interface JobApplication {
  id: number;
  jobOfferId: number;
  applicantId: string;
  applicationDate: Date;
  status: ApplicationStatus;
  matchScore: number;
  hrNotes?: string;
  jobOffer?: JobOffer;
  applicant?: User;
}

// Candidate Recommendation
export interface CandidateRecommendation {
  userId: string;
  fullName: string;
  email: string;
  position?: string;
  department?: string;
  yearsOfExperience: number;
  matchScore: number;
  performanceScore: number;
  achievementsCount: number;
  certificatesCount: number;
}

// HR Dashboard Stats
export interface HRDashboardStats {
  pendingUsersCount: number;
  openJobOffersCount: number;
  pendingApplicationsCount: number;
}
