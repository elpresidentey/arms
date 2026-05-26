import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecyclablesService } from './recyclables.service';
import { RecyclablesController } from './recyclables.controller';
import { Recyclable } from './entities/recyclable.entity';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recyclable]), WalletModule, NotificationsModule],
  providers: [RecyclablesService],
  controllers: [RecyclablesController],
  exports: [RecyclablesService],
})
export class RecyclablesModule {}
