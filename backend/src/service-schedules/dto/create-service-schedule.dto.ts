import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

export class CreateServiceScheduleDto {
  @IsString()
  serviceType: string;

  @IsString()
  ward: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsString()
  zone: string;

  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed'])
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed';

  @IsArray()
  @IsString({ each: true })
  serviceDays: string[];

  @IsString()
  startTimeWindow: string;

  @IsString()
  endTimeWindow: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  operatorName?: string;

  @IsOptional()
  @IsPhoneNumber()
  operatorPhoneNumber?: string;

  @IsOptional()
  @IsEmail()
  operatorEmail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceProviders?: string[];

  @IsOptional()
  @IsDateString()
  effectiveFromDate?: string;

  @IsOptional()
  @IsDateString()
  effectiveToDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
