import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  ServiceRequestPriority,
  ServiceRequestStatus,
  ServiceRequestType,
} from '../entities/service-request.entity';

export class CreateServiceRequestDto {
  @IsEnum(ServiceRequestType)
  type: ServiceRequestType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  address: string;

  @IsString()
  ward: string;

  @IsString()
  street: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(ServiceRequestPriority)
  priority?: ServiceRequestPriority;

  @IsOptional()
  @IsDateString()
  preferredDate?: string;
}

export class UpdateServiceRequestDto {
  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;

  @IsOptional()
  @IsEnum(ServiceRequestPriority)
  priority?: ServiceRequestPriority;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  preferredDate?: string;
}
