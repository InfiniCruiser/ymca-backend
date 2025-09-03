import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, IsEmail, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoleSchema } from '@ymca/shared';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @ApiProperty({ enum: UserRoleSchema.enum, description: 'User role' })
  @IsEnum(UserRoleSchema.enum)
  role: string;

  @ApiPropertyOptional({ description: 'Program areas' })
  @IsOptional()
  @IsArray()
  programAreas?: string[];

  @ApiPropertyOptional({ description: 'Locations' })
  @IsOptional()
  @IsArray()
  locations?: string[];

  @ApiPropertyOptional({ description: 'User active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: UserRoleSchema.enum, description: 'User role' })
  @IsOptional()
  @IsEnum(UserRoleSchema.enum)
  role?: string;

  @ApiPropertyOptional({ description: 'Program areas' })
  @IsOptional()
  @IsArray()
  programAreas?: string[];

  @ApiPropertyOptional({ description: 'Locations' })
  @IsOptional()
  @IsArray()
  locations?: string[];

  @ApiPropertyOptional({ description: 'User active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
