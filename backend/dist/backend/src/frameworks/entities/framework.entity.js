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
exports.Framework = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const section_entity_1 = require("./section.entity");
let Framework = class Framework {
    get displayName() {
        return `${this.name} v${this.version}`;
    }
    get isCurrent() {
        return this.isActive && (!this.expiryDate || this.expiryDate > new Date());
    }
    get isExpired() {
        return this.expiryDate ? this.expiryDate <= new Date() : false;
    }
    getSectionCount() {
        return this.sections?.length || 0;
    }
    getQuestionCount() {
        return this.sections?.reduce((total, section) => {
            return total + section.areas?.reduce((areaTotal, area) => {
                return areaTotal + (area.questions?.length || 0);
            }, 0) || 0;
        }, 0) || 0;
    }
    getSectionByName(name) {
        return this.sections?.find(section => section.name === name);
    }
    getAreaByPath(sectionName, areaName) {
        const section = this.getSectionByName(sectionName);
        return section?.areas?.find(area => area.name === areaName);
    }
    getQuestionById(questionId) {
        for (const section of this.sections || []) {
            for (const area of section.areas || []) {
                const question = area.questions?.find(q => q.id === questionId);
                if (question)
                    return question;
            }
        }
        return null;
    }
    validateStructure() {
        const errors = [];
        if (!this.sections || this.sections.length === 0) {
            errors.push('Framework must have at least one section');
        }
        for (const section of this.sections || []) {
            if (!section.areas || section.areas.length === 0) {
                errors.push(`Section "${section.name}" must have at least one area`);
            }
            for (const area of section.areas || []) {
                if (!area.questions || area.questions.length === 0) {
                    errors.push(`Area "${area.name}" in section "${section.name}" must have at least one question`);
                }
                for (const question of area.questions || []) {
                    if (!question.id) {
                        errors.push(`Question in area "${area.name}" must have an ID`);
                    }
                    if (!question.prompt) {
                        errors.push(`Question ${question.id} must have a prompt`);
                    }
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};
exports.Framework = Framework;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Framework.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Framework.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Framework.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Framework.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Framework.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Framework.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Framework.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Framework.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Framework.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Framework.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => section_entity_1.Section, section => section.framework),
    __metadata("design:type", Array)
], Framework.prototype, "sections", void 0);
exports.Framework = Framework = __decorate([
    (0, typeorm_1.Entity)('frameworks'),
    (0, typeorm_1.Index)(['name', 'version'], { unique: true })
], Framework);
//# sourceMappingURL=framework.entity.js.map