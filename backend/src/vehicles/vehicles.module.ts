import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { FleetAlertsService } from './fleet-alerts.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { VehicleAssignment } from '../drivers/entities/vehicle-assignment.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      MaintenanceRecord,
      VehicleAssignment,
      Driver,
    ]),
    NotificationsModule,
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, FleetAlertsService],
  exports: [VehiclesService, FleetAlertsService],
})
export class VehiclesModule {}