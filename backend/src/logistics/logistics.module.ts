import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionRoute } from '../collection-routes/entities/collection-route.entity';
import { Report } from '../reports/entities/report.entity';
import { ServiceRequest } from '../service-requests/entities/service-request.entity';
import { WasteCollection } from '../waste-collection/entities/waste-collection.entity';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionRoute, WasteCollection, ServiceRequest, Report])],
  controllers: [LogisticsController],
  providers: [LogisticsService],
})
export class LogisticsModule {}
