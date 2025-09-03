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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: {
                email: createUserDto.email,
                organizationId: createUserDto.organizationId
            }
        });
        if (existingUser) {
            throw new common_1.ConflictException(`User with email '${createUserDto.email}' already exists in this organization`);
        }
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }
    async findAll() {
        return this.userRepository.find({
            where: { isActive: true },
            order: { firstName: 'ASC', lastName: 'ASC' }
        });
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id }
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID '${id}' not found`);
        }
        return user;
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: {
                    email: updateUserDto.email,
                    organizationId: user.organizationId
                }
            });
            if (existingUser) {
                throw new common_1.ConflictException(`User with email '${updateUserDto.email}' already exists in this organization`);
            }
        }
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        user.isActive = false;
        await this.userRepository.save(user);
    }
    async findByOrganization(organizationId) {
        return this.userRepository.find({
            where: { organizationId, isActive: true },
            order: { firstName: 'ASC', lastName: 'ASC' }
        });
    }
    async findByRole(role) {
        return this.userRepository.find({
            where: { role, isActive: true },
            order: { firstName: 'ASC', lastName: 'ASC' }
        });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email, isActive: true }
        });
    }
    async updateLastLogin(id) {
        const user = await this.findOne(id);
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map