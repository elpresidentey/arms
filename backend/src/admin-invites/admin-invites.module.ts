import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminInvitesController } from './admin-invites.controller';
import { AdminInvitesService } from './admin-invites.service';
import { AdminInvite } from './entities/admin-invite.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdminInvite]), NotificationsModule],
  controllers: [AdminInvitesController],
  providers: [AdminInvitesService],
  exports: [AdminInvitesService],
})
export class AdminInvitesModule {}
