import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionRequest } from './entities/collection-request.entity';
import { CollectionRequestsService } from './collection-requests.service';
import { CollectionRequestsController } from './collection-requests.controller';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionRequest, User]), NotificationsModule],
  providers: [CollectionRequestsService],
  controllers: [CollectionRequestsController],
  exports: [CollectionRequestsService],
})
export class CollectionRequestsModule {}
