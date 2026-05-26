import { Controller, ForbiddenException, Get, Param, Patch, UseGuards, Post, Request, Body } from '@nestjs/common';
import { WasteCollectionService } from './waste-collection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('waste-collections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WasteCollectionController {
  constructor(private readonly wasteCollectionService: WasteCollectionService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === 'resident') {
      return this.wasteCollectionService.getMyCollections(req.user.userId);
    }

    return this.wasteCollectionService.findAll();
  }

  @Get('stats')
  getStats(@Request() req: { user: { userId: string; role: string } }) {
    return this.wasteCollectionService.getStats(req.user.role === 'resident' ? req.user.userId : undefined);
  }

  @Get('my-collections')
  getMyCollections(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view personal collection history');
    return this.wasteCollectionService.getMyCollections(req.user.userId);
  }

  @Post('schedule')
  scheduleCollection(@Request() req: { user: { userId: string; role: string } }, @Body() scheduleData: { scheduledDate: string; notes?: string }) {
    this.ensureResident(req.user.role, 'Only resident accounts can schedule household refuse collection');
    return this.wasteCollectionService.scheduleCollection(req.user.userId, scheduleData);
  }

  @Patch(':id/confirm')
  confirmCollection(
    @Param('id') id: string,
    @Body() confirmData: { observedTruckCode: string },
    @Request() req: { user: { userId: string; role: string } },
  ) {
    this.ensureResident(req.user.role, 'Only resident accounts can confirm household refuse collection');
    return this.wasteCollectionService.confirmCollection(id, confirmData.observedTruckCode, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { userId: string; role: string } }) {
    return this.wasteCollectionService.findOneForUser(id, req.user.userId, req.user.role);
  }

  @Patch(':id/verify')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  verifyCollection(@Param('id') id: string) {
    return this.wasteCollectionService.verifyCollection(id);
  }

  private ensureResident(role: string, message: string) {
    if (role !== UserRole.RESIDENT) {
      throw new ForbiddenException(message);
    }
  }
}
