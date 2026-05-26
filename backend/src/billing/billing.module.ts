import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Bill } from './entities/bill.entity';
import { BillPayment } from './entities/bill-payment.entity';
import { User } from '../users/entities/user.entity';
import { PaystackModule } from '../paystack/paystack.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill, BillPayment, User]),
    PaystackModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
