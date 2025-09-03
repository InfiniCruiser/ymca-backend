import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with same email in same organization already exists
    const existingUser = await this.userRepository.findOne({
      where: { 
        email: createUserDto.email,
        organizationId: createUserDto.organizationId
      }
    });

    if (existingUser) {
      throw new ConflictException(`User with email '${createUserDto.email}' already exists in this organization`);
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isActive: true },
      order: { firstName: 'ASC', lastName: 'ASC' }
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it conflicts with existing user in same organization
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { 
          email: updateUserDto.email,
          organizationId: user.organizationId
        }
      });

      if (existingUser) {
        throw new ConflictException(`User with email '${updateUserDto.email}' already exists in this organization`);
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Soft delete by setting isActive to false
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { organizationId, isActive: true },
      order: { firstName: 'ASC', lastName: 'ASC' }
    });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userRepository.find({
      where: { role, isActive: true },
      order: { firstName: 'ASC', lastName: 'ASC' }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isActive: true }
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }
}
