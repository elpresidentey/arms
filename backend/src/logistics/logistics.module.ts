import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionRoute } from '../collection-routes/entities/collection-route.entity';
import { Report } from '../reports/entities/report.entity';
import { ServiceRequest } from '../service-requests/entities/service-request.entity';
import { WasteCollection } from '../waste-collection/entities/waste-collection.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleAssignment } from '../drivers/entities/vehicle-assignment.entity';
import { RouteExecution } from '../route-executions/entities/route-execution.entity';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollectionRoute, 
      WasteCollection, 
      ServiceRequest, 
      Report,
      Driver,
      Vehicle,
      VehicleAssignment,
      RouteExecution,
    ])
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
