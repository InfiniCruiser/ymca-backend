import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationType } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Check if organization with same code already exists
    const existingOrg = await this.organizationRepository.findOne({
      where: { code: createOrganizationDto.code }
    });

    if (existingOrg) {
      throw new ConflictException(`Organization with code '${createOrganizationDto.code}' already exists`);
    }

    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID '${id}' not found`);
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);

    // Check if code is being changed and if it conflicts with existing organization
    if (updateOrganizationDto.code && updateOrganizationDto.code !== organization.code) {
      const existingOrg = await this.organizationRepository.findOne({
        where: { code: updateOrganizationDto.code }
      });

      if (existingOrg) {
        throw new ConflictException(`Organization with code '${updateOrganizationDto.code}' already exists`);
      }
    }

    Object.assign(organization, updateOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    
    // Soft delete by setting isActive to false
    organization.isActive = false;
    await this.organizationRepository.save(organization);
  }

  async getChildren(id: string): Promise<Organization[]> {
    const organization = await this.findOne(id);
    return this.organizationRepository.find({
      where: { parentId: id, isActive: true },
      order: { name: 'ASC' }
    });
  }

  async getParent(id: string): Promise<Organization | null> {
    const organization = await this.findOne(id);
    
    if (!organization.parentId) {
      return null;
    }

    return this.organizationRepository.findOne({
      where: { id: organization.parentId, isActive: true }
    });
  }

  async findByType(type: OrganizationType): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { type, isActive: true },
      order: { name: 'ASC' }
    });
  }

  async count(): Promise<number> {
    return this.organizationRepository.count({
      where: { isActive: true }
    });
  }

  async getHierarchy(): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { name: 'ASC' }
    });
  }
}
