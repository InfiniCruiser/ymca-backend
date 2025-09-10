import { z } from 'zod';

// ============================================================================
// CORE SCHEMAS
// ============================================================================

export const UserRoleSchema = z.enum([
  'PROGRAM_OWNER',
  'ASSOCIATION_ADMIN', 
  'BOARD_LIAISON',
  'YUSA_REVIEWER',
  'AUDITOR',
  'TESTER'
]);

export const ResponseStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS', 
  'NEEDS_EVIDENCE',
  'SUBMITTED',
  'RETURNED',
  'APPROVED'
]);

export const PeriodStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'REVIEW',
  'BOARD_APPROVED',
  'FINALIZED',
  'ARCHIVED'
]);

export const QuestionTypeSchema = z.enum([
  'single_select',
  'multi_select', 
  'text',
  'date',
  'number',
  'file_upload'
]);

export const EvidenceTypeSchema = z.enum([
  'file',
  'link',
  'integration_data'
]);

// ============================================================================
// BASIC INTERFACES
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: z.infer<typeof UserRoleSchema>;
  programAreas?: string[];
  locations?: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'LOCAL_Y' | 'REGIONAL' | 'NATIONAL';
  parentId?: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  areaId: string;
  section: string;
  metric: string;
  prompt: string;
  type: z.infer<typeof QuestionTypeSchema>;
  options?: string[];
  required: boolean;
  documentsToReview?: string[];
  dataSource?: string;
  yusaAccess: boolean;
  validation: Record<string, any>;
  frequency: 'annual' | 'quarterly' | 'monthly';
  helpText?: string;
  sortOrder: number;
}

export interface Response {
  id: string;
  periodId: string;
  questionId: string;
  ownerId: string;
  answer?: string;
  answerDate?: Date;
  notes?: string;
  status: z.infer<typeof ResponseStatusSchema>;
  evidence: Evidence[];
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
}

export interface Evidence {
  id: string;
  responseId: string;
  type: z.infer<typeof EvidenceTypeSchema>;
  uri: string;
  filename?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
  expiresOn?: Date;
  metadata?: Record<string, any>;
  isReused: boolean;
  originalResponseId?: string;
}

export interface Review {
  id: string;
  responseId: string;
  reviewerId: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'RETURNED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportingPeriod {
  id: string;
  organizationId: string;
  frameworkId: string;
  label: string;
  startDate: Date;
  endDate: Date;
  status: z.infer<typeof PeriodStatusSchema>;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  finalizedAt?: Date;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


