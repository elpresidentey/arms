import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { VehicleAssignment } from '../drivers/entities/vehicle-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      MaintenanceRecord,
      VehicleAssignment,
    ]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}