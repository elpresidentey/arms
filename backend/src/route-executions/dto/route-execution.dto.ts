import { 
  IsString, 
  IsUUID, 
  IsEnum, 
  IsOptional, 
  IsDateString, 
  IsNumber, 
  Min, 
  Max,
  IsPositive 
} from 'class-validator';
import { ExecutionStatus } from '../entities/route-execution.entity';

export class CreateRouteExecutionDto {
  @IsUUID()
  routeId: string;

  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedStops?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRouteExecutionDto {
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedStops?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completedStops?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalDistance?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  fuelUsed?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  wasteCollected?: number;

  @IsOptional()
  @IsString()
  wasteUnit?: string;

  @IsOptional()
  @IsString()
  delayReason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  delayMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StartRouteDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  startMileage?: number;

  @IsOptional()
  @IsString()
  startLocation?: string;

  @IsOptional()
  @IsNumber()
  startLatitude?: number;

  @IsOptional()
  @IsNumber()
  startLongitude?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteRouteDto {
  @IsNumber()
  @Min(0)
  completedStops: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalDistance?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  fuelUsed?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  wasteCollected?: number;

  @IsOptional()
  @IsString()
  wasteUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  endMileage?: number;

  @IsOptional()
  @IsString()
  endLocation?: string;

  @IsOptional()
  @IsNumber()
  endLatitude?: number;

  @IsOptional()
  @IsNumber()
  endLongitude?: number;

  @IsOptional()
  @IsString()
  routeGpsTrace?: string; // JSON string of GPS coordinates

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  driverRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  residentSatisfaction?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReportIssueDto {
  @IsString()
  issue: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  delayMinutes?: number;
}