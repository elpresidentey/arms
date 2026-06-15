import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteExecution } from './entities/route-execution.entity';
import { RouteExecutionsService } from './route-executions.service';
import { RouteExecutionsController } from './route-executions.controller';
import { CollectionRoute } from '../collection-routes/entities/collection-route.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RouteExecution,
      CollectionRoute,
      Driver,
      Vehicle,
    ]),
  ],
  controllers: [RouteExecutionsController],
  providers: [RouteExecutionsService],
  exports: [RouteExecutionsService],
})
export class RouteExecutionsModule {}