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
exports.Area = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const section_entity_1 = require("./section.entity");
const question_entity_1 = require("./question.entity");
let Area = class Area {
    get displayName() {
        return this.name;
    }
    get fullPath() {
        return `${this.section?.name} > ${this.name}`;
    }
    get questionCount() {
        return this.questions?.length || 0;
    }
    get requiredQuestionCount() {
        return this.questions?.filter(q => q.required).length || 0;
    }
    getQuestionById(questionId) {
        return this.questions?.find(question => question.id === questionId);
    }
    getQuestionBySortOrder(sortOrder) {
        return this.questions?.find(question => question.sortOrder === sortOrder);
    }
    getQuestionsByType(type) {
        return this.questions?.filter(question => question.type === type) || [];
    }
    getRequiredQuestions() {
        return this.questions?.filter(question => question.required) || [];
    }
    getQuestionsRequiringEvidence() {
        return this.questions?.filter(question => question.validation?.evidenceRequiredIf &&
            question.validation.evidenceRequiredIf.length > 0) || [];
    }
    getComplianceScore(responses) {
        const totalQuestions = this.questionCount;
        if (totalQuestions === 0) {
            return { score: 0, total: 0, answered: 0 };
        }
        const areaResponses = responses.filter(r => {
            const question = this.getQuestionById(r.questionId);
            return question !== null;
        });
        const answeredQuestions = areaResponses.length;
        const compliantQuestions = areaResponses.filter(r => ['Yes', 'Qualified Yes'].includes(r.answer)).length;
        const score = totalQuestions > 0 ? Math.round((compliantQuestions / totalQuestions) * 100) : 0;
        return {
            score,
            total: totalQuestions,
            answered: answeredQuestions
        };
    }
    getProgressStatus(responses) {
        const statusCounts = {
            notStarted: 0,
            inProgress: 0,
            needsEvidence: 0,
            submitted: 0,
            returned: 0,
            approved: 0
        };
        for (const question of this.questions || []) {
            const response = responses.find(r => r.questionId === question.id);
            if (!response) {
                statusCounts.notStarted++;
            }
            else {
                statusCounts[response.status.toLowerCase()]++;
            }
        }
        return statusCounts;
    }
    getDueQuestions(responses, dueDate) {
        return this.questions?.filter(question => {
            const response = responses.find(r => r.questionId === question.id);
            if (!response || response.status === 'APPROVED') {
                return false;
            }
            const lastUpdated = response.updatedAt || response.createdAt;
            return new Date(lastUpdated) < dueDate;
        }) || [];
    }
};
exports.Area = Area;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Area.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Area.prototype, "sectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Area.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Area.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Area.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Area.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Area.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Area.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => section_entity_1.Section, section => section.areas, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sectionId' }),
    __metadata("design:type", section_entity_1.Section)
], Area.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => question_entity_1.Question, question => question.area, { cascade: true }),
    __metadata("design:type", Array)
], Area.prototype, "questions", void 0);
exports.Area = Area = __decorate([
    (0, typeorm_1.Entity)('areas'),
    (0, typeorm_1.Index)(['sectionId', 'sortOrder'])
], Area);
//# sourceMappingURL=area.entity.js.map