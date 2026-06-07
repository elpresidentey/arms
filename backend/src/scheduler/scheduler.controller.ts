import { Controller, Post, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('bills/generate')
  @Roles(UserRole.ADMIN)
  async generateBills() {
    await this.schedulerService.runBillGeneration();
    return { message: 'Bill generation triggered successfully' };
  }

  @Post('routes/schedule') 
  @Roles(UserRole.ADMIN)
  async scheduleRoutes() {
    await this.schedulerService.runRouteScheduling();
    return { message: 'Route scheduling triggered successfully' };
  }

  @Post('bills/late-fees')
  @Roles(UserRole.ADMIN) 
  async applyLateFees() {
    await this.schedulerService.applyLateFees();
    return { message: 'Late fee application triggered successfully' };
  }

  @Get('status')
  @Roles(UserRole.ADMIN)
  async getSchedulerStatus() {
    return {
      message: 'Scheduler is running',
      jobs: [
        { name: 'generateMonthlyBills', schedule: '0 6 1 * *', description: 'Generate monthly bills on the 1st of each month at 6 AM' },
        { name: 'applyLateFees', schedule: '0 7 * * *', description: 'Apply late fees daily at 7 AM' },
        { name: 'scheduleCollectionRoutes', schedule: '0 5 * * *', description: 'Schedule collection routes daily at 5 AM' },
        { name: 'updateCollectionStatuses', schedule: '0 */1 * * *', description: 'Update collection statuses hourly' },
      ]
    };
  }
}