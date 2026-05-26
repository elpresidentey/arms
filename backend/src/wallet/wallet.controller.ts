import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('banks')
  getBanks(@Request() req: { user: { role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can load payout banks');
    return this.walletService.getBanks();
  }

  @Post('resolve-account')
  resolveAccount(@Body() body: { accountNumber: string; bankCode: string }, @Request() req: { user: { role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can verify payout accounts');
    return this.walletService.resolveAccount(body.accountNumber, body.bankCode);
  }

  @Get('transactions')
  getTransactions(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view wallet transactions');
    return this.walletService.findAllByUser(req.user.userId);
  }

  @Get('withdrawals')
  getWithdrawals(@Request() req: { user: { role: string } }) {
    this.walletService.assertCanReviewWithdrawals(req.user.role);
    return this.walletService.findWithdrawals();
  }

  @Get('withdrawals/:id/status')
  getWithdrawalStatus(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    this.walletService.assertCanReviewWithdrawals(req.user.role);
    return this.walletService.verifyWithdrawalStatus(id);
  }

  @Get('balance')
  getBalance(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view wallet balance');
    return this.walletService.getBalanceByUser(req.user.userId);
  }

  @Get('withdrawal-limits')
  getWithdrawalLimits(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view withdrawal limits');
    return this.walletService.getWithdrawalLimits(req.user.userId);
  }

  @Get('summary')
  getTransactionSummary(@Request() req: { user: { userId: string; role: string } }) {
    this.ensureResident(req.user.role, 'Only resident accounts can view wallet summary');
    return this.walletService.getTransactionSummary(req.user.userId);
  }

  @Post('withdraw')
  withdraw(
    @Body() body: { amount: number; accountNumber: string; bankCode: string; accountName?: string },
    @Request() req: { user: { userId: string; role: string } },
  ) {
    this.ensureResident(req.user.role, 'Only resident accounts can request wallet withdrawals');
    return this.walletService.withdraw(
      {
        amount: body.amount,
        accountNumber: body.accountNumber,
        bankCode: body.bankCode,
        accountName: body.accountName,
      },
      req.user.userId,
    );
  }

  @Get('admin/pending-withdrawals')
  getPendingWithdrawals(@Request() req: { user: { role: string } }) {
    this.walletService.assertCanReviewWithdrawals(req.user.role);
    return this.walletService.getPendingWithdrawals();
  }

  @Post('admin/withdrawals/:id/approve')
  approveWithdrawal(
    @Param('id') id: string,
    @Request() req: { user: { userId: string; role: string } },
  ) {
    this.walletService.assertCanReviewWithdrawals(req.user.role);
    return this.walletService.approveWithdrawal(id, req.user.userId);
  }

  @Post('admin/withdrawals/:id/reject')
  rejectWithdrawal(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req: { user: { userId: string; role: string } },
  ) {
    this.walletService.assertCanReviewWithdrawals(req.user.role);
    if (!body.reason) {
      throw new ForbiddenException('Rejection reason is required');
    }
    return this.walletService.rejectWithdrawal(id, body.reason, req.user.userId);
  }

  private ensureResident(role: string, message: string) {
    if (role !== UserRole.RESIDENT) {
      throw new ForbiddenException(message);
    }
  }
}
