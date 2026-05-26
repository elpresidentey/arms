import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BillStatus } from './entities/bill.entity';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * Get current user's bills
   * GET /billing/my-bills
   */
  @Get('my-bills')
  async getMyBills(@Request() req) {
    return this.billingService.getUserBills(req.user.userId);
  }

  /**
   * Get all bills (admin only)
   * GET /billing
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async getAllBills(@Query('status') status?: BillStatus) {
    return this.billingService.getAllBills(status);
  }

  /**
   * Get billing statistics (admin only)
   * GET /billing/stats
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async getStatistics() {
    return this.billingService.getStatistics();
  }

  /**
   * Generate monthly bills (admin only)
   * POST /billing/generate
   */
  @Post('generate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async generateBills(@Query('period') period?: string) {
    return this.billingService.generateMonthlyBills(period);
  }

  /**
   * Apply late fees to overdue bills (admin only)
   * POST /billing/apply-late-fees
   */
  @Post('apply-late-fees')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async applyLateFees() {
    return this.billingService.applyLateFees();
  }

  /**
   * Get all bill payments (admin)
   * GET /billing/payments
   */
  @Get('payments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER, UserRole.SUPERVISOR)
  async getAllPayments(@Query('status') status?: string) {
    return this.billingService.getAllPayments(status);
  }

  /**
   * Approve a pending payment (admin)
   * POST /billing/payments/:id/approve
   */
  @Post('payments/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async approvePayment(@Param('id') id: string, @Request() req) {
    return this.billingService.approvePayment(id, req.user.userId);
  }

  /**
   * Reject a pending payment (admin)
   * POST /billing/payments/:id/reject
   */
  @Post('payments/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async rejectPayment(
    @Param('id') id: string,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.billingService.rejectPayment(id, req.user.userId, reason);
  }

  /**
   * List residents for bill issuance (admin)
   * GET /billing/residents
   */
  @Get('residents')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async listResidents(@Query('search') search?: string) {
    return this.billingService.listResidentsForBilling(search);
  }

  /**
   * Issue a bill to one resident (admin)
   * POST /billing/issue
   */
  @Post('issue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  async issueBill(
    @Body('userId') userId: string,
    @Body('period') period?: string,
  ) {
    return this.billingService.issueBillForUser(userId, period);
  }

  /**
   * Verify payment
   * GET /billing/verify/:reference
   */
  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.billingService.verifyPayment(reference);
  }

  /**
   * Get a single bill
   * GET /billing/:id
   */
  @Get(':id')
  async getBill(@Param('id') id: string, @Request() req) {
    const bill = await this.billingService.getBill(id);

    const isAdmin = [UserRole.ADMIN, UserRole.FINANCE_OFFICER].includes(req.user.role);
    if (bill.userId !== req.user.userId && !isAdmin) {
      throw new ForbiddenException('You do not have access to this bill');
    }

    return bill;
  }

  /**
   * Initiate payment for a bill
   * POST /billing/:id/pay
   */
  @Post(':id/pay')
  async initiatePayment(@Param('id') id: string, @Request() req) {
    return this.billingService.initiatePayment(id, req.user.userId, req.user.email);
  }
}
