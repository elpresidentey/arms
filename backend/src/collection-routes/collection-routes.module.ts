import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { WasteCollection } from '../waste-collection/entities/waste-collection.entity';
import { User } from '../users/entities/user.entity';
import { CollectionRoutesController } from './collection-routes.controller';
import { CollectionRoutesService } from './collection-routes.service';
import { CollectionRoute } from './entities/collection-route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionRoute, User, WasteCollection]), NotificationsModule],
  controllers: [CollectionRoutesController],
  providers: [CollectionRoutesService],
  exports: [CollectionRoutesService],
})
export class CollectionRoutesModule {}
