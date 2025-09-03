"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const framework_entity_1 = require("./entities/framework.entity");
const section_entity_1 = require("./entities/section.entity");
const area_entity_1 = require("./entities/area.entity");
const question_entity_1 = require("./entities/question.entity");
let FrameworksModule = class FrameworksModule {
};
exports.FrameworksModule = FrameworksModule;
exports.FrameworksModule = FrameworksModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([framework_entity_1.Framework, section_entity_1.Section, area_entity_1.Area, question_entity_1.Question])],
        exports: [typeorm_1.TypeOrmModule],
    })
], FrameworksModule);
//# sourceMappingURL=frameworks.module.js.map