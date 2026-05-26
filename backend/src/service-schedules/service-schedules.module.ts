import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceSchedulesService } from './service-schedules.service';
import { ServiceSchedulesController } from './service-schedules.controller';
import { ServiceSchedule } from './entities/service-schedule.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceSchedule]), NotificationsModule],
  controllers: [ServiceSchedulesController],
  providers: [ServiceSchedulesService],
  exports: [ServiceSchedulesService],
})
export class ServiceSchedulesModule {}
