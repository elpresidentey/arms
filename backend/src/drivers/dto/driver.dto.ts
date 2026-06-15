import { IsString, IsUUID, IsEnum, IsOptional, IsDateString, IsNumber, Min, Max, IsArray } from 'class-validator';
import { DriverStatus, LicenseClass } from '../entities/driver.entity';

export class CreateDriverDto {
  @IsUUID()
  userId: string;

  @IsString()
  licenseNumber: string;

  @IsEnum(LicenseClass)
  licenseClass: LicenseClass;

  @IsDateString()
  licenseExpiryDate: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsDateString()
  hireDate: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsEnum(LicenseClass)
  licenseClass?: LicenseClass;

  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  performanceRating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignVehicleDto {
  @IsUUID()
  vehicleId: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class DriverQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  licenseClass?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  includeInactive?: string;
}