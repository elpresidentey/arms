import { IsOptional, IsString } from 'class-validator';

export class ResidentCollectionConfirmationDto {
  @IsOptional()
  @IsString()
  observedTruckCode?: string;
}
