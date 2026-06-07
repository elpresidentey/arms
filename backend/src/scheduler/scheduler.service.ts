import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Bill, BillStatus } from '../billing/entities/bill.entity';
import { CollectionRoute, RouteStatus } from '../collection-routes/entities/collection-route.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(CollectionRoute)
    private routeRepository: Repository<CollectionRoute>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private billingService: BillingService,
  ) {}

  // Run daily at 6:00 AM to generate monthly bills
  @Cron('0 6 1 * *', {
    name: 'generateMonthlyBills',
    timeZone: 'Africa/Lagos',
  })
  async generateMonthlyBills() {
    this.logger.log('Starting monthly bill generation...');

    try {
      // Get all active residents
      const residents = await this.userRepository.find({
        where: { role: UserRole.RESIDENT },
      });

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed, billing period uses 1-indexed
      const currentYear = currentDate.getFullYear();
      const billingPeriod = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

      let generatedCount = 0;

      for (const resident of residents) {
        // Check if bill already exists for this billing period
        const existingBill = await this.billRepository.findOne({
          where: {
            userId: resident.id,
            billingPeriod: billingPeriod,
          },
        });

        if (!existingBill) {
          try {
            await this.billingService.generateMonthlyBill(resident.id);
            generatedCount++;
            this.logger.log(`Generated bill for resident ${resident.id}`);
          } catch (error) {
            this.logger.error(
              `Failed to generate bill for resident ${resident.id}:`,
              error.message,
            );
          }
        }
      }

      this.logger.log(`Monthly bill generation completed. Generated ${generatedCount} bills.`);
    } catch (error) {
      this.logger.error('Monthly bill generation failed:', error.message);
    }
  }

  // Run daily at 7:00 AM to apply late fees
  @Cron('0 7 * * *', {
    name: 'applyLateFees',
    timeZone: 'Africa/Lagos',
  })
  async applyLateFees() {
    this.logger.log('Starting late fee application...');

    try {
      const now = new Date();
      const overdueBills = await this.billRepository.find({
        where: {
          status: BillStatus.PENDING,
          dueDate: LessThan(now),
        },
      });

      let appliedCount = 0;

      for (const bill of overdueBills) {
        try {
          const lateFee = bill.totalAmount * 0.05; // 5% late fee
          bill.lateFee = lateFee;
          bill.totalAmount += lateFee;
          bill.status = BillStatus.OVERDUE;

          await this.billRepository.save(bill);
          appliedCount++;
          
          this.logger.log(`Applied late fee to bill ${bill.id}`);
        } catch (error) {
          this.logger.error(
            `Failed to apply late fee to bill ${bill.id}:`,
            error.message,
          );
        }
      }

      this.logger.log(`Late fee application completed. Applied to ${appliedCount} bills.`);
    } catch (error) {
      this.logger.error('Late fee application failed:', error.message);
    }
  }

  // Run daily at 5:00 AM to schedule collection routes
  @Cron('0 5 * * *', {
    name: 'scheduleCollectionRoutes',
    timeZone: 'Africa/Lagos',
  })
  async scheduleCollectionRoutes() {
    this.logger.log('Starting automatic route scheduling...');

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find routes that need scheduling for tomorrow
      const routesToSchedule = await this.routeRepository.find({
        where: {
          status: RouteStatus.ACTIVE,
        },
      });

      let scheduledCount = 0;

      for (const route of routesToSchedule) {
        try {
          // Calculate next collection date based on frequency
          const nextDate = this.calculateNextCollectionDate(route, tomorrow);
          
          route.nextCollectionDate = nextDate;
          
          await this.routeRepository.save(route);
          scheduledCount++;
          
          this.logger.log(`Scheduled route ${route.id} for ${nextDate.toISOString()}`);
        } catch (error) {
          this.logger.error(
            `Failed to schedule route ${route.id}:`,
            error.message,
          );
        }
      }

      this.logger.log(`Route scheduling completed. Scheduled ${scheduledCount} routes.`);
    } catch (error) {
      this.logger.error('Route scheduling failed:', error.message);
    }
  }

  // Run every hour to update collection statuses
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'updateCollectionStatuses',
  })
  async updateCollectionStatuses() {
    this.logger.log('Updating collection statuses...');

    try {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));

      // Mark collections as missed if they're overdue by 2+ hours
      const overdueRoutes = await this.routeRepository.find({
        where: {
          status: RouteStatus.ACTIVE,
          nextCollectionDate: LessThan(twoHoursAgo),
        },
      });

      let updatedCount = 0;

      for (const route of overdueRoutes) {
        route.status = RouteStatus.DISRUPTED; // Using DISRUPTED instead of 'missed'
        await this.routeRepository.save(route);
        updatedCount++;
      }

      this.logger.log(`Updated ${updatedCount} overdue collections to 'disrupted' status.`);
    } catch (error) {
      this.logger.error('Collection status update failed:', error.message);
    }
  }

  private calculateNextCollectionDate(route: CollectionRoute, baseDate: Date): Date {
    const nextDate = new Date(baseDate);
    
    // Default to weekly collection if frequency not specified
    const frequency = route.frequency || 'weekly';
    
    switch (frequency) {
      case 'daily':
        // Already tomorrow, no additional days to add
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 6); // +7 days total from base
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 13); // +14 days total
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        // Default to weekly
        nextDate.setDate(nextDate.getDate() + 6);
    }
    
    return nextDate;
  }

  // Manual trigger for testing purposes
  async runBillGeneration() {
    this.logger.log('Manually triggered bill generation');
    await this.generateMonthlyBills();
  }

  async runRouteScheduling() {
    this.logger.log('Manually triggered route scheduling');
    await this.scheduleCollectionRoutes();
  }
}