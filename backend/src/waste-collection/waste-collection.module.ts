import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WasteCollectionService } from './waste-collection.service';
import { WasteCollectionController } from './waste-collection.controller';
import { WasteCollection } from './entities/waste-collection.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([WasteCollection]), UsersModule, NotificationsModule],
  providers: [WasteCollectionService],
  controllers: [WasteCollectionController],
  exports: [WasteCollectionService],
})
export class WasteCollectionModule {}
