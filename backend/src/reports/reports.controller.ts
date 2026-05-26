import { Body, Controller, Get, Param, Patch, Post, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === 'resident') {
      return this.reportsService.findMine(req.user.userId);
    }

    return this.reportsService.findAll();
  }

  @Post()
  create(@Body() body: Record<string, unknown>, @Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role !== UserRole.RESIDENT) {
      throw new ForbiddenException('Only resident accounts can submit reports');
    }

    return this.reportsService.create({ ...body, reporterId: req.user.userId });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.reportsService.update(id, body);
  }
}
