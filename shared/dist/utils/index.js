"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSTANTS = exports.CreatePeriodSchema = exports.UpdateResponseSchema = exports.CreateResponseSchema = exports.getErrorMessage = exports.isApiError = exports.sanitizeUrl = exports.buildApiUrl = exports.sortByField = exports.filterByDateRange = exports.filterByStatus = exports.searchInText = exports.getDaysUntilExpiry = exports.isEvidenceExpiring = exports.isDocumentFile = exports.isImageFile = exports.getFileExtension = exports.getScoreLabel = exports.getScoreColor = exports.calculateComplianceScore = exports.formatPhoneNumber = exports.formatFileSize = exports.formatDateTime = exports.formatDate = exports.isEditableStatus = exports.isCompletedStatus = exports.getStatusLabel = exports.getStatusColor = exports.canFinalizePeriod = exports.canReviewResponse = exports.canEditResponse = exports.hasPermission = exports.ROLE_HIERARCHY = exports.ROLES = exports.validateDate = exports.validateUUID = exports.validateEmail = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
const validateEmail = (email) => {
    const emailSchema = zod_1.z.string().email();
    return emailSchema.safeParse(email).success;
};
exports.validateEmail = validateEmail;
const validateUUID = (uuid) => {
    const uuidSchema = zod_1.z.string().uuid();
    return uuidSchema.safeParse(uuid).success;
};
exports.validateUUID = validateUUID;
const validateDate = (date) => {
    const dateSchema = zod_1.z.string().datetime();
    return dateSchema.safeParse(date).success;
};
exports.validateDate = validateDate;
// ============================================================================
// ROLE & PERMISSION UTILITIES
// ============================================================================
exports.ROLES = {
    PROGRAM_OWNER: 'PROGRAM_OWNER',
    ASSOCIATION_ADMIN: 'ASSOCIATION_ADMIN',
    BOARD_LIAISON: 'BOARD_LIAISON',
    YUSA_REVIEWER: 'YUSA_REVIEWER',
    AUDITOR: 'AUDITOR',
    TESTER: 'TESTER'
};
exports.ROLE_HIERARCHY = {
    [exports.ROLES.PROGRAM_OWNER]: 1,
    [exports.ROLES.ASSOCIATION_ADMIN]: 2,
    [exports.ROLES.BOARD_LIAISON]: 3,
    [exports.ROLES.YUSA_REVIEWER]: 4,
    [exports.ROLES.AUDITOR]: 5,
    [exports.ROLES.TESTER]: 0 // Testers have special permissions, not hierarchical
};
const hasPermission = (userRole, requiredRole) => {
    // Testers have special permissions - they can access everything for testing
    if (userRole === exports.ROLES.TESTER) {
        return true;
    }
    return exports.ROLE_HIERARCHY[userRole] >= exports.ROLE_HIERARCHY[requiredRole];
};
exports.hasPermission = hasPermission;
const canEditResponse = (userRole, responseStatus) => {
    // Testers can edit any response for testing purposes
    if (userRole === exports.ROLES.TESTER) {
        return true;
    }
    if (userRole === exports.ROLES.PROGRAM_OWNER) {
        return ['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_EVIDENCE', 'RETURNED'].includes(responseStatus);
    }
    if (userRole === exports.ROLES.ASSOCIATION_ADMIN) {
        return ['SUBMITTED', 'RETURNED'].includes(responseStatus);
    }
    return false;
};
exports.canEditResponse = canEditResponse;
const canReviewResponse = (userRole) => {
    // Testers can review responses for testing purposes
    if (userRole === exports.ROLES.TESTER) {
        return true;
    }
    return userRole === exports.ROLES.ASSOCIATION_ADMIN || userRole === exports.ROLES.YUSA_REVIEWER;
};
exports.canReviewResponse = canReviewResponse;
const canFinalizePeriod = (userRole) => {
    // Testers can finalize periods for testing purposes
    if (userRole === exports.ROLES.TESTER) {
        return true;
    }
    return userRole === exports.ROLES.ASSOCIATION_ADMIN || userRole === exports.ROLES.BOARD_LIAISON;
};
exports.canFinalizePeriod = canFinalizePeriod;
// ============================================================================
// STATUS UTILITIES
// ============================================================================
const getStatusColor = (status) => {
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
exports.getStatusColor = getStatusColor;
const getStatusLabel = (status) => {
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
exports.getStatusLabel = getStatusLabel;
const isCompletedStatus = (status) => {
    return ['APPROVED', 'SUBMITTED'].includes(status);
};
exports.isCompletedStatus = isCompletedStatus;
const isEditableStatus = (status) => {
    return ['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_EVIDENCE', 'RETURNED'].includes(status);
};
exports.isEditableStatus = isEditableStatus;
// ============================================================================
// FORMATTING UTILITIES
// ============================================================================
const formatDate = (date, options) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.formatDateTime = formatDateTime;
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
};
exports.formatPhoneNumber = formatPhoneNumber;
// ============================================================================
// COMPLIANCE SCORING UTILITIES
// ============================================================================
const calculateComplianceScore = (totalQuestions, compliantQuestions) => {
    if (totalQuestions === 0)
        return 0;
    return Math.round((compliantQuestions / totalQuestions) * 100);
};
exports.calculateComplianceScore = calculateComplianceScore;
const getScoreColor = (score) => {
    if (score >= 90)
        return 'green';
    if (score >= 75)
        return 'yellow';
    if (score >= 60)
        return 'orange';
    return 'red';
};
exports.getScoreColor = getScoreColor;
const getScoreLabel = (score) => {
    if (score >= 90)
        return 'Excellent';
    if (score >= 75)
        return 'Good';
    if (score >= 60)
        return 'Fair';
    return 'Needs Improvement';
};
exports.getScoreLabel = getScoreLabel;
// ============================================================================
// EVIDENCE UTILITIES
// ============================================================================
const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
};
exports.getFileExtension = getFileExtension;
const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes((0, exports.getFileExtension)(filename));
};
exports.isImageFile = isImageFile;
const isDocumentFile = (filename) => {
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    return documentExtensions.includes((0, exports.getFileExtension)(filename));
};
exports.isDocumentFile = isDocumentFile;
const isEvidenceExpiring = (expiresOn, daysThreshold = 30) => {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));
    return expiresOn <= thresholdDate;
};
exports.isEvidenceExpiring = isEvidenceExpiring;
const getDaysUntilExpiry = (expiresOn) => {
    const now = new Date();
    const diffTime = expiresOn.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
exports.getDaysUntilExpiry = getDaysUntilExpiry;
// ============================================================================
// SEARCH & FILTER UTILITIES
// ============================================================================
const searchInText = (text, searchTerm) => {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
};
exports.searchInText = searchInText;
const filterByStatus = (items, statuses) => {
    if (statuses.length === 0)
        return items;
    return items.filter(item => statuses.includes(item.status));
};
exports.filterByStatus = filterByStatus;
const filterByDateRange = (items, startDate, endDate) => {
    return items.filter(item => {
        const itemDate = new Date(item.createdAt);
        if (startDate && itemDate < startDate)
            return false;
        if (endDate && itemDate > endDate)
            return false;
        return true;
    });
};
exports.filterByDateRange = filterByDateRange;
const sortByField = (items, field, direction = 'asc') => {
    return [...items].sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        if (aValue < bValue)
            return direction === 'asc' ? -1 : 1;
        if (aValue > bValue)
            return direction === 'asc' ? 1 : -1;
        return 0;
    });
};
exports.sortByField = sortByField;
// ============================================================================
// URL & ROUTING UTILITIES
// ============================================================================
const buildApiUrl = (endpoint, params) => {
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
exports.buildApiUrl = buildApiUrl;
const sanitizeUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.toString();
    }
    catch {
        return '';
    }
};
exports.sanitizeUrl = sanitizeUrl;
// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================
const isApiError = (error) => {
    return error && typeof error.message === 'string';
};
exports.isApiError = isApiError;
const getErrorMessage = (error) => {
    if ((0, exports.isApiError)(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};
exports.getErrorMessage = getErrorMessage;
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
exports.CreateResponseSchema = zod_1.z.object({
    periodId: zod_1.z.string().uuid(),
    questionId: zod_1.z.string(),
    answer: zod_1.z.string().optional(),
    answerDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
    evidence: zod_1.z.array(zod_1.z.object({
        type: types_1.EvidenceTypeSchema,
        uri: zod_1.z.string().url(),
        filename: zod_1.z.string().optional(),
        description: zod_1.z.string().optional()
    })).optional()
});
exports.UpdateResponseSchema = exports.CreateResponseSchema.partial().extend({
    id: zod_1.z.string().uuid()
});
exports.CreatePeriodSchema = zod_1.z.object({
    organizationId: zod_1.z.string().uuid(),
    frameworkId: zod_1.z.string().uuid(),
    label: zod_1.z.string().min(1),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    settings: zod_1.z.object({
        allowEvidenceReuse: zod_1.z.boolean(),
        requireBoardApproval: zod_1.z.boolean(),
        autoFinalize: zod_1.z.boolean()
    }).optional()
});
// ============================================================================
// CONSTANTS
// ============================================================================
exports.CONSTANTS = {
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
};
//# sourceMappingURL=index.js.map