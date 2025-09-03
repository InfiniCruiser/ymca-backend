import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { YMCAImportService } from './services/ymca-import.service';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly ymcaImportService: YMCAImportService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ status: 201, description: 'Organization created successfully', type: Organization })
  async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'List of all organizations', type: [Organization] })
  async findAll(): Promise<Organization[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization found', type: Organization })
  async findOne(@Param('id') id: string): Promise<Organization> {
    return this.organizationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization by ID' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({ status: 200, description: 'Organization updated successfully', type: Organization })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ): Promise<Organization> {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete organization by ID' })
  @ApiResponse({ status: 204, description: 'Organization deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.organizationsService.remove(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child organizations' })
  @ApiResponse({ status: 200, description: 'Child organizations', type: [Organization] })
  async getChildren(@Param('id') id: string): Promise<Organization[]> {
    return this.organizationsService.getChildren(id);
  }

  @Get(':id/parent')
  @ApiOperation({ summary: 'Get parent organization' })
  @ApiResponse({ status: 200, description: 'Parent organization', type: Organization })
  async getParent(@Param('id') id: string): Promise<Organization | null> {
    return this.organizationsService.getParent(id);
  }

  @Post('import/ymca')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import YMCA associations from CSV file' })
  @ApiResponse({ status: 200, description: 'Import completed successfully' })
  async importYMCAData(): Promise<{ imported: number; updated: number; errors: number }> {
    return this.ymcaImportService.importYMCAData();
  }

  @Post('import/ymca/upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import YMCA associations from uploaded CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Import completed successfully' })
  async importYMCADataFromFile(@UploadedFile() file: Express.Multer.File): Promise<{ imported: number; updated: number; errors: number }> {
    // Save uploaded file temporarily and import
    const fs = require('fs');
    const path = require('path');
    const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}_ymca_import.csv`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempPath, file.buffer);
    
    try {
      const result = await this.ymcaImportService.importYMCAData(tempPath);
      // Clean up temp file
      fs.unlinkSync(tempPath);
      return result;
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw error;
    }
  }
}
