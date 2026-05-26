import { Body, Controller, Get, Patch, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminInvitesService } from './admin-invites.service';

@Controller('admin-invites')
export class AdminInvitesController {
  constructor(private readonly adminInvitesService: AdminInvitesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createInvite(
    @Request() req: { user: { userId: string } },
    @Body() body: { email: string; expiresInHours?: number; note?: string },
  ) {
    return this.adminInvitesService.createInvite(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  listInvites() {
    return this.adminInvitesService.listInvites();
  }

  @Post('validate')
  validateInvite(@Body() body: { email: string; token: string }) {
    return this.adminInvitesService.validateInvite(body.email, body.token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/revoke')
  revokeInvite(@Param('id') id: string) {
    return this.adminInvitesService.revokeInvite(id);
  }
}
