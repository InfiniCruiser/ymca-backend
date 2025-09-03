"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const area_entity_1 = require("./area.entity");
const shared_1 = require("@ymca/shared");
let Question = class Question {
    get displayName() {
        return this.metric;
    }
    get fullPath() {
        return `${this.section} > ${this.metric}`;
    }
    get isSingleSelect() {
        return this.type === 'single_select';
    }
    get isMultiSelect() {
        return this.type === 'multi_select';
    }
    get isTextInput() {
        return this.type === 'text';
    }
    get isDateInput() {
        return this.type === 'date';
    }
    get isNumberInput() {
        return this.type === 'number';
    }
    get isFileUpload() {
        return this.type === 'file_upload';
    }
    get requiresEvidence() {
        return !!(this.validation?.evidenceRequiredIf && this.validation.evidenceRequiredIf.length > 0);
    }
    get requiresDate() {
        return this.validation?.requiresDate || false;
    }
    get requiresOwner() {
        return this.validation?.requiresOwner || false;
    }
    requiresEvidenceForAnswer(answer) {
        return this.validation?.evidenceRequiredIf?.includes(answer) || false;
    }
    requiresDateForAnswer(answer) {
        return this.validation?.requiresDateIf?.includes(answer) || false;
    }
    validateAnswer(answer) {
        const errors = [];
        if (this.required && (!answer || answer.trim() === '')) {
            errors.push('This question is required');
            return { isValid: false, errors };
        }
        if (this.isSingleSelect || this.isMultiSelect) {
            if (this.options && this.options.length > 0) {
                if (this.isSingleSelect) {
                    if (!this.options.includes(answer)) {
                        errors.push(`Answer must be one of: ${this.options.join(', ')}`);
                    }
                }
                else if (this.isMultiSelect) {
                    const answers = Array.isArray(answer) ? answer : [answer];
                    const invalidAnswers = answers.filter(a => !this.options?.includes(a));
                    if (invalidAnswers.length > 0) {
                        errors.push(`Invalid answers: ${invalidAnswers.join(', ')}`);
                    }
                }
            }
        }
        if (this.isNumberInput && answer) {
            const numValue = parseFloat(answer);
            if (isNaN(numValue)) {
                errors.push('Answer must be a valid number');
            }
            else {
                if (this.validation?.minValue !== undefined && numValue < this.validation.minValue) {
                    errors.push(`Value must be at least ${this.validation.minValue}`);
                }
                if (this.validation?.maxValue !== undefined && numValue > this.validation.maxValue) {
                    errors.push(`Value must be at most ${this.validation.maxValue}`);
                }
            }
        }
        if (this.isDateInput && answer) {
            const dateValue = new Date(answer);
            if (isNaN(dateValue.getTime())) {
                errors.push('Answer must be a valid date');
            }
        }
        if (this.isTextInput && answer && this.validation?.pattern) {
            const regex = new RegExp(this.validation.pattern);
            if (!regex.test(answer)) {
                errors.push('Answer does not match required format');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    getValidationRules() {
        const rules = [];
        if (this.required) {
            rules.push('Required');
        }
        if (this.requiresEvidence) {
            rules.push(`Evidence required for: ${this.validation?.evidenceRequiredIf?.join(', ')}`);
        }
        if (this.requiresDate) {
            rules.push('Date required');
        }
        if (this.validation?.minValue !== undefined) {
            rules.push(`Minimum value: ${this.validation.minValue}`);
        }
        if (this.validation?.maxValue !== undefined) {
            rules.push(`Maximum value: ${this.validation.maxValue}`);
        }
        if (this.validation?.pattern) {
            rules.push('Must match specific format');
        }
        return rules;
    }
    getEstimatedTime() {
        return this.metadata?.estimatedTime || 5;
    }
    getDifficulty() {
        return this.metadata?.difficulty || 'medium';
    }
    getPriority() {
        return this.metadata?.priority || 'medium';
    }
    isHighPriority() {
        return this.getPriority() === 'high' || this.getPriority() === 'critical';
    }
    isCritical() {
        return this.getPriority() === 'critical';
    }
};
exports.Question = Question;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Question.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Question.prototype, "areaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Question.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Question.prototype, "metric", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Question.prototype, "prompt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_1.QuestionTypeSchema.enum
    }),
    (0, class_validator_1.IsEnum)(shared_1.QuestionTypeSchema.enum),
    __metadata("design:type", String)
], Question.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], Question.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Question.prototype, "required", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], Question.prototype, "documentsToReview", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Question.prototype, "dataSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Question.prototype, "yusaAccess", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Question.prototype, "validation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'annual' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Question.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Question.prototype, "helpText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Question.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Question.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Question.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Question.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => area_entity_1.Area, area => area.questions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'areaId' }),
    __metadata("design:type", area_entity_1.Area)
], Question.prototype, "area", void 0);
exports.Question = Question = __decorate([
    (0, typeorm_1.Entity)('questions'),
    (0, typeorm_1.Index)(['areaId', 'sortOrder']),
    (0, typeorm_1.Index)(['id'], { unique: true })
], Question);
//# sourceMappingURL=question.entity.js.map