import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceScheduleDto } from './create-service-schedule.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateServiceScheduleDto extends PartialType(
  CreateServiceScheduleDto,
) {
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived', 'suspended'])
  status?: 'draft' | 'published' | 'archived' | 'suspended';
}
