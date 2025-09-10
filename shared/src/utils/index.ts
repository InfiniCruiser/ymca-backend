import { z } from 'zod';
import { 
  UserRoleSchema, 
  ResponseStatusSchema, 
  PeriodStatusSchema,
  QuestionTypeSchema,
  EvidenceTypeSchema 
} from '../types';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const validateEmail = (email: string): boolean => {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
};

export const validateUUID = (uuid: string): boolean => {
  const uuidSchema = z.string().uuid();
  return uuidSchema.safeParse(uuid).success;
};

export const validateDate = (date: string): boolean => {
  const dateSchema = z.string().datetime();
  return dateSchema.safeParse(date).success;
};

// ============================================================================
// ROLE & PERMISSION UTILITIES
// ============================================================================

export const ROLES = {
  PROGRAM_OWNER: 'PROGRAM_OWNER',
  ASSOCIATION_ADMIN: 'ASSOCIATION_ADMIN',
  BOARD_LIAISON: 'BOARD_LIAISON',
  YUSA_REVIEWER: 'YUSA_REVIEWER',
  AUDITOR: 'AUDITOR',
  TESTER: 'TESTER'
} as const;

export const ROLE_HIERARCHY = {
  [ROLES.PROGRAM_OWNER]: 1,
  [ROLES.ASSOCIATION_ADMIN]: 2,
  [ROLES.BOARD_LIAISON]: 3,
  [ROLES.YUSA_REVIEWER]: 4,
  [ROLES.AUDITOR]: 5,
  [ROLES.TESTER]: 0  // Testers have special permissions, not hierarchical
} as const;

export const hasPermission = (
  userRole: z.infer<typeof UserRoleSchema>,
  requiredRole: z.infer<typeof UserRoleSchema>
): boolean => {
  // Testers have special permissions - they can access everything for testing
  if (userRole === ROLES.TESTER) {
    return true;
  }
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const canEditResponse = (
  userRole: z.infer<typeof UserRoleSchema>,
  responseStatus: z.infer<typeof ResponseStatusSchema>
): boolean => {
  // Testers can edit any response for testing purposes
  if (userRole === ROLES.TESTER) {
    return true;
  }
  if (userRole === ROLES.PROGRAM_OWNER) {
    return ['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_EVIDENCE', 'RETURNED'].includes(responseStatus);
  }
  if (userRole === ROLES.ASSOCIATION_ADMIN) {
    return ['SUBMITTED', 'RETURNED'].includes(responseStatus);
  }
  return false;
};

export const canReviewResponse = (
  userRole: z.infer<typeof UserRoleSchema>
): boolean => {
  // Testers can review responses for testing purposes
  if (userRole === ROLES.TESTER) {
    return true;
  }
  return userRole === ROLES.ASSOCIATION_ADMIN || userRole === ROLES.YUSA_REVIEWER;
};

export const canFinalizePeriod = (
  userRole: z.infer<typeof UserRoleSchema>
): boolean => {
  // Testers can finalize periods for testing purposes
  if (userRole === ROLES.TESTER) {
    return true;
  }
  return userRole === ROLES.ASSOCIATION_ADMIN || userRole === ROLES.BOARD_LIAISON;
};

// ============================================================================
// STATUS UTILITIES
// ============================================================================

export const getStatusColor = (status: z.infer<typeof ResponseStatusSchema>): string => {
  const statusColors = {
    NOT_STARTED: 'gray',
    IN_PROGRESS: 'blue',
    NEEDS_EVIDENCE: 'yellow',
    SUBMITTED: 'purple',
    RETURNED: 'red',
    APPROVED: 'green'
  };
  return statusColors[status] || 'gray';
};

export const getStatusLabel = (status: z.infer<typeof ResponseStatusSchema>): string => {
  const statusLabels = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    NEEDS_EVIDENCE: 'Needs Evidence',
    SUBMITTED: 'Submitted',
    RETURNED: 'Returned',
    APPROVED: 'Approved'
  };
  return statusLabels[status] || status;
};

export const isCompletedStatus = (status: z.infer<typeof ResponseStatusSchema>): boolean => {
  return ['APPROVED', 'SUBMITTED'].includes(status);
};

export const isEditableStatus = (status: z.infer<typeof ResponseStatusSchema>): boolean => {
  return ['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_EVIDENCE', 'RETURNED'].includes(status);
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

// ============================================================================
// COMPLIANCE SCORING UTILITIES
// ============================================================================

export const calculateComplianceScore = (
  totalQuestions: number,
  compliantQuestions: number
): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((compliantQuestions / totalQuestions) * 100);
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'green';
  if (score >= 75) return 'yellow';
  if (score >= 60) return 'orange';
  return 'red';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
};

// ============================================================================
// EVIDENCE UTILITIES
// ============================================================================

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isDocumentFile = (filename: string): boolean => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  return documentExtensions.includes(getFileExtension(filename));
};

export const isEvidenceExpiring = (expiresOn: Date, daysThreshold: number = 30): boolean => {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));
  return expiresOn <= thresholdDate;
};

export const getDaysUntilExpiry = (expiresOn: Date): number => {
  const now = new Date();
  const diffTime = expiresOn.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================================================
// SEARCH & FILTER UTILITIES
// ============================================================================

export const searchInText = (text: string, searchTerm: string): boolean => {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

export const filterByStatus = <T extends { status: string }>(
  items: T[],
  statuses: string[]
): T[] => {
  if (statuses.length === 0) return items;
  return items.filter(item => statuses.includes(item.status));
};

export const filterByDateRange = <T extends { createdAt: Date }>(
  items: T[],
  startDate?: Date,
  endDate?: Date
): T[] => {
  return items.filter(item => {
    const itemDate = new Date(item.createdAt);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
};

export const sortByField = <T>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// ============================================================================
// URL & ROUTING UTILITIES
// ============================================================================

export const buildApiUrl = (endpoint: string, params?: Record<string, any>): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const url = new URL(endpoint, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};

export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    return '';
  }
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export const isApiError = (error: any): error is { message: string; status?: number } => {
  return error && typeof error.message === 'string';
};

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const CreateResponseSchema = z.object({
  periodId: z.string().uuid(),
  questionId: z.string(),
  answer: z.string().optional(),
  answerDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  evidence: z.array(z.object({
    type: EvidenceTypeSchema,
    uri: z.string().url(),
    filename: z.string().optional(),
    description: z.string().optional()
  })).optional()
});

export const UpdateResponseSchema = CreateResponseSchema.partial().extend({
  id: z.string().uuid()
});

export const CreatePeriodSchema = z.object({
  organizationId: z.string().uuid(),
  frameworkId: z.string().uuid(),
  label: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  settings: z.object({
    allowEvidenceReuse: z.boolean(),
    requireBoardApproval: z.boolean(),
    autoFinalize: z.boolean()
  }).optional()
});

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  EVIDENCE_EXPIRY_WARNING_DAYS: 30,
  EVIDENCE_EXPIRY_CRITICAL_DAYS: 7,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const;
