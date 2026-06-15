import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { LogisticsService } from './logistics.service';

@Controller('logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  getSummary() {
    return this.logisticsService.getSummary();
  }

  @Get('fleet-details')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  getFleetDetails() {
    return this.logisticsService.getFleetDetails();
  }
}
