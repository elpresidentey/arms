import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PayoutsService } from './payouts.service';
import { PayoutStatus, PayoutType } from './entities/payout-request.entity';
import { PaystackService } from '../paystack/paystack.service';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('payouts')
@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(
    private readonly payoutsService: PayoutsService,
    private readonly paystackService: PaystackService,
  ) {}

  @Post('request')
  @ApiOperation({ summary: 'Create a payout request' })
  async createPayoutRequest(
    @Request() req: { user: { userId: string; role: string } },
    @Body() createPayoutDto: {
      amount: number;
      type?: PayoutType;
      notes?: string;
    },
  ) {
    this.ensureResident(req.user.role, 'Only resident accounts can create payout requests');
    return this.payoutsService.createPayoutRequest(
      req.user.userId,
      createPayoutDto.amount,
      createPayoutDto.type || PayoutType.WALLET_WITHDRAWAL,
      createPayoutDto.notes,
    );
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get user payout requests' })
  async getUserPayoutRequests(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view personal payout requests');
    return this.payoutsService.getUserPayoutRequests(req.user.userId);
  }

  @Get('banks')
  @ApiOperation({ summary: 'Get list of banks' })
  async getBanks(@Request() req: { user: { role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can load payout banks');
    return this.paystackService.getBanks();
  }

  @Post('verify-account')
  @ApiOperation({ summary: 'Verify bank account' })
  async verifyAccount(
    @Body() verifyAccountDto: {
      accountNumber: string;
      bankCode: string;
    },
    @Request() req: { user: { role: string } },
  ) {
    this.ensureResident(req.user.role, 'Only resident accounts can verify payout accounts');
    return this.paystackService.verifyAccount(
      verifyAccountDto.accountNumber,
      verifyAccountDto.bankCode,
    );
  }

  @Post('create-recipient')
  @ApiOperation({ summary: 'Create transfer recipient' })
  async createRecipient(
    @Body() createRecipientDto: {
      accountNumber: string;
      bankCode: string;
      accountName: string;
    },
    @Request() req: { user: { role: string } },
  ) {
    this.ensureResident(req.user.role, 'Only resident accounts can create payout recipients');
    const result = await this.paystackService.createRecipient(
      'nuban',
      createRecipientDto.accountName,
      createRecipientDto.accountNumber,
      createRecipientDto.bankCode,
    );

    // Update user's paystack recipient code
    // TODO: Update user entity with recipient code

    return result;
  }

  // Finance/Admin endpoints
  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Get all payout requests (Finance/Admin)' })
  @ApiQuery({ name: 'status', required: false, enum: PayoutStatus })
  async getAllPayoutRequests(@Query('status') status?: PayoutStatus) {
    return this.payoutsService.getAllPayoutRequests(status);
  }

  @Put('admin/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Approve payout request (Finance/Admin)' })
  @ApiParam({ name: 'id', description: 'Payout request ID' })
  async approvePayoutRequest(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.payoutsService.approvePayoutRequest(id, req.user.userId);
  }

  @Put('admin/:id/process')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Process payout (Finance/Admin)' })
  @ApiParam({ name: 'id', description: 'Payout request ID' })
  async processPayout(@Param('id') id: string) {
    return this.payoutsService.processPayout(id);
  }

  @Put('admin/:id/reject')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Reject payout request (Finance/Admin)' })
  @ApiParam({ name: 'id', description: 'Payout request ID' })
  async rejectPayoutRequest(
    @Param('id') id: string,
    @Body() rejectDto: { reason: string },
    @Request() req: { user: { userId: string } },
  ) {
    if (!rejectDto.reason) {
      throw new BadRequestException('Rejection reason is required');
    }
    return this.payoutsService.rejectPayoutRequest(id, rejectDto.reason, req.user.userId);
  }

  @Put('admin/:id/update-status')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Update payout status (Finance/Admin)' })
  @ApiParam({ name: 'id', description: 'Payout request ID' })
  async updatePayoutStatus(@Param('id') id: string) {
    return this.payoutsService.updatePayoutStatus(id);
  }

  @Get('admin/statistics')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Get payout statistics (Finance/Admin)' })
  async getPayoutStatistics() {
    return this.payoutsService.getPayoutStatistics();
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Get payout request details (Finance/Admin)' })
  @ApiParam({ name: 'id', description: 'Payout request ID' })
  async getPayoutRequest(@Param('id') id: string) {
    // TODO: Implement get single payout request
    return this.payoutsService.getAllPayoutRequests().then(requests => 
      requests.find(r => r.id === id)
    );
  }

  private ensureResident(role: string, message: string) {
    if (role !== UserRole.RESIDENT) {
      throw new ForbiddenException(message);
    }
  }
}
