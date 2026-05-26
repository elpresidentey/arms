import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { RecyclablesService } from './recyclables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('recyclables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecyclablesController {
  constructor(private readonly recyclablesService: RecyclablesService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === 'resident') {
      return this.recyclablesService.getMyRecyclables(req.user.userId);
    }

    return this.recyclablesService.findAll();
  }

  @Get('my-recyclables')
  getMyRecyclables(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view personal recyclables');
    return this.recyclablesService.getMyRecyclables(req.user.userId);
  }

  @Get('valuation-summary')
  getValuationSummary(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view recycling valuation summaries');
    return this.recyclablesService.getValuationSummary(req.user.userId);
  }

  @Post('submit')
  submitWithValuation(@Body() body: Record<string, unknown>, @Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can submit recyclables');
    return this.recyclablesService.createWithValuation({ ...body, userId: req.user.userId });
  }

  @Post()
  create(@Body() body: Record<string, unknown>, @Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can add recyclables');
    return this.recyclablesService.create({ ...body, userId: req.user.userId });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECYCLER, UserRole.WARD_OFFICER, UserRole.SUPERVISOR)
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.recyclablesService.update(id, body);
  }

  @Patch(':id/request-pickup')
  requestPickup(@Param('id') id: string, @Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can request recyclable pickup');
    return this.recyclablesService.requestPickupForUser(id, req.user.userId);
  }

  private ensureResident(role: string, message: string) {
    if (role !== UserRole.RESIDENT) {
      throw new ForbiddenException(message);
    }
  }
}
