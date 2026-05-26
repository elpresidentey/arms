import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletTransaction } from './entities/wallet.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaystackService } from './paystack.service';

@Module({
  imports: [TypeOrmModule.forFeature([WalletTransaction]), NotificationsModule],
  providers: [WalletService, PaystackService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
