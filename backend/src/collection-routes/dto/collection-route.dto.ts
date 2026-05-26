import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RouteFrequency, RouteStatus } from '../entities/collection-route.entity';

export class CreateCollectionRouteDto {
  @IsString()
  name: string;

  @IsString()
  ward: string;

  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsEnum(RouteFrequency)
  frequency?: RouteFrequency;

  @IsString()
  serviceDay: string;

  @IsString()
  startTimeWindow: string;

  @IsString()
  endTimeWindow: string;

  @IsDateString()
  nextCollectionDate: string;

  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;

  @IsOptional()
  @IsString()
  pspOperatorId?: string;

  @IsOptional()
  @IsString()
  truckCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCollectionRouteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsEnum(RouteFrequency)
  frequency?: RouteFrequency;

  @IsOptional()
  @IsString()
  serviceDay?: string;

  @IsOptional()
  @IsString()
  startTimeWindow?: string;

  @IsOptional()
  @IsString()
  endTimeWindow?: string;

  @IsOptional()
  @IsDateString()
  nextCollectionDate?: string;

  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;

  @IsOptional()
  @IsString()
  pspOperatorId?: string;

  @IsOptional()
  @IsString()
  truckCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteCollectionRouteDto {
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
