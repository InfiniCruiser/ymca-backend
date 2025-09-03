import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { YMCAImportService } from './services/ymca-import.service';
import { Organization } from './entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, YMCAImportService],
  exports: [OrganizationsService, YMCAImportService, TypeOrmModule],
})
export class OrganizationsModule {}
