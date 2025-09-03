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
exports.Section = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const framework_entity_1 = require("./framework.entity");
const area_entity_1 = require("./area.entity");
let Section = class Section {
    get displayName() {
        return this.name;
    }
    get areaCount() {
        return this.areas?.length || 0;
    }
    get questionCount() {
        return this.areas?.reduce((total, area) => {
            return total + (area.questions?.length || 0);
        }, 0) || 0;
    }
    getAreaByName(name) {
        return this.areas?.find(area => area.name === name);
    }
    getAreaBySortOrder(sortOrder) {
        return this.areas?.find(area => area.sortOrder === sortOrder);
    }
    getQuestionById(questionId) {
        for (const area of this.areas || []) {
            const question = area.questions?.find(q => q.id === questionId);
            if (question)
                return question;
        }
        return null;
    }
    getQuestionsByType(type) {
        const questions = [];
        for (const area of this.areas || []) {
            const areaQuestions = area.questions?.filter(q => q.type === type) || [];
            questions.push(...areaQuestions);
        }
        return questions;
    }
    getRequiredQuestions() {
        const questions = [];
        for (const area of this.areas || []) {
            const requiredQuestions = area.questions?.filter(q => q.required) || [];
            questions.push(...requiredQuestions);
        }
        return questions;
    }
    getComplianceScore(responses) {
        const totalQuestions = this.questionCount;
        if (totalQuestions === 0) {
            return { score: 0, total: 0, answered: 0 };
        }
        const sectionResponses = responses.filter(r => {
            const question = this.getQuestionById(r.questionId);
            return question !== null;
        });
        const answeredQuestions = sectionResponses.length;
        const compliantQuestions = sectionResponses.filter(r => ['Yes', 'Qualified Yes'].includes(r.answer)).length;
        const score = totalQuestions > 0 ? Math.round((compliantQuestions / totalQuestions) * 100) : 0;
        return {
            score,
            total: totalQuestions,
            answered: answeredQuestions
        };
    }
};
exports.Section = Section;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Section.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Section.prototype, "frameworkId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Section.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Section.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Section.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Section.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Section.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Section.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => framework_entity_1.Framework, framework => framework.sections, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'frameworkId' }),
    __metadata("design:type", framework_entity_1.Framework)
], Section.prototype, "framework", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => area_entity_1.Area, area => area.section, { cascade: true }),
    __metadata("design:type", Array)
], Section.prototype, "areas", void 0);
exports.Section = Section = __decorate([
    (0, typeorm_1.Entity)('sections'),
    (0, typeorm_1.Index)(['frameworkId', 'sortOrder'])
], Section);
//# sourceMappingURL=section.entity.js.map