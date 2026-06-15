import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsDateString, 
  IsNumber, 
  Min, 
  IsPositive 
} from 'class-validator';
import { 
  VehicleStatus, 
  VehicleType, 
  FuelType 
} from '../entities/vehicle.entity';
import { 
  MaintenanceType, 
  MaintenanceStatus, 
  MaintenancePriority 
} from '../entities/maintenance-record.entity';

export class CreateVehicleDto {
  @IsString()
  plateNumber: string;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1900)
  year: number;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsString()
  capacityUnit: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsDateString()
  purchaseDate: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  purchasePrice?: number;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  registrationExpiry?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentMileage?: number;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  capacity?: number;

  @IsOptional()
  @IsString()
  capacityUnit?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  registrationExpiry?: string;

  @IsOptional()
  @IsDateString()
  lastServiceDate?: string;

  @IsOptional()
  @IsDateString()
  nextServiceDue?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentMileage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fuelEfficiency?: number;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ScheduleMaintenanceDto {
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mileageAtMaintenance?: number;

  @IsOptional()
  @IsString()
  serviceProvider?: string;

  @IsOptional()
  @IsString()
  technician?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedCost?: number;

  @IsOptional()
  @IsDateString()
  nextServiceDue?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nextServiceMileage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  startedDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mileageAtMaintenance?: number;

  @IsOptional()
  @IsString()
  serviceProvider?: string;

  @IsOptional()
  @IsString()
  technician?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  actualCost?: number;

  @IsOptional()
  @IsString()
  workPerformed?: string;

  @IsOptional()
  @IsDateString()
  nextServiceDue?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nextServiceMileage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}