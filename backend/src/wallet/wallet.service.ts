import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TransactionSource, TransactionType, WalletTransaction } from './entities/wallet.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PaystackService } from './paystack.service';

const FINANCE_REVIEW_ROLES = ['admin', 'finance_officer', 'supervisor'];
const BALANCE_AFFECTING_STATUSES = new Set(['approved', 'pending', 'completed']);

type WithdrawalRequest = {
  amount: number;
  accountNumber: string;
  bankCode: string;
  accountName?: string;
};

@Injectable()
export class WalletService {
  private readonly minWithdrawal = 100;
  private readonly maxWithdrawal = 50000;
  private readonly dailyWithdrawalLimit = 100000;

  constructor(
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private notificationsService: NotificationsService,
    private paystackService: PaystackService,
  ) {}

  async findAll(): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findAllByUser(userId: string): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findWithdrawals(): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      where: {
        type: TransactionType.DEBIT,
        source: TransactionSource.WITHDRAWAL,
      },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async verifyWithdrawalStatus(id: string) {
    const transaction = await this.walletTransactionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!transaction || transaction.source !== TransactionSource.WITHDRAWAL) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (!transaction.externalTransactionId) {
      throw new BadRequestException('Withdrawal does not have a Paystack transfer reference');
    }

    const transfer = await this.paystackService.verifyTransfer(transaction.externalTransactionId);
    return {
      transaction,
      paystack: {
        id: transfer.id,
        transferCode: transfer.transfer_code,
        reference: transfer.reference,
        status: transfer.status || 'unknown',
      },
    };
  }

  async getBalance() {
    const transactions = await this.findAll();
    const balance = this.calculateBalance(transactions);

    return { balance };
  }

  async getBalanceByUser(userId: string) {
    const transactions = await this.findAllByUser(userId);
    const balance = this.calculateBalance(transactions);

    return { balance };
  }

  private calculateBalance(transactions: WalletTransaction[]): number {
    return transactions
      .filter((transaction) => BALANCE_AFFECTING_STATUSES.has(transaction.status || 'approved'))
      .reduce((sum, transaction) => {
        const amount = Number(transaction.amount) || 0;
        return transaction.type === 'credit' ? sum + amount : sum - amount;
      }, 0);
  }

  getBanks() {
    return this.paystackService.listBanks();
  }

  assertCanReviewWithdrawals(role?: string) {
    const allowedRoles = ['admin', 'finance_officer', 'supervisor'];
    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('Finance review access is required');
    }
  }

  resolveAccount(accountNumber: string, bankCode: string) {
    return this.paystackService.resolveAccount(accountNumber, bankCode);
  }

  async withdraw(request: WithdrawalRequest, userId: string): Promise<{ message: string; requiresApproval: boolean; withdrawalRequest?: any }> {
    const amount = Number(request.amount);
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    if (amount < this.minWithdrawal) {
      throw new BadRequestException(`Minimum withdrawal amount is NGN ${this.minWithdrawal}`);
    }

    if (amount > this.maxWithdrawal) {
      throw new BadRequestException(`Maximum withdrawal amount is NGN ${this.maxWithdrawal}`);
    }

    if (!request.accountNumber || !request.bankCode) {
      throw new BadRequestException('Bank and account number are required');
    }

    const balance = await this.getBalanceByUser(userId);
    if (amount > balance.balance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Check daily withdrawal limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayTransactions = await this.walletTransactionRepository.find({
      where: {
        userId,
        type: TransactionType.DEBIT,
        source: TransactionSource.WITHDRAWAL,
        createdAt: Between(today, tomorrow),
      },
    });

    const dailyWithdrawn = todayTransactions
      .filter((tx) => BALANCE_AFFECTING_STATUSES.has(tx.status || 'approved'))
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    if (dailyWithdrawn + amount > this.dailyWithdrawalLimit) {
      throw new BadRequestException(`Daily withdrawal limit of NGN ${this.dailyWithdrawalLimit} exceeded`);
    }

    // Verify account details (skip in test mode to avoid API limits)
    const isTestMode = process.env.PAYSTACK_TEST_MODE === 'true';
    let accountName: string;
    let verifiedAccountNumber: string;

    if (isTestMode) {
      // In test mode, use provided details without verification
      accountName = request.accountName || 'Test Account';
      verifiedAccountNumber = request.accountNumber;
    } else {
      // In production mode, verify account with Paystack
      const account = await this.paystackService.resolveAccount(request.accountNumber, request.bankCode);
      accountName = request.accountName || account.account_name;
      verifiedAccountNumber = account.account_number;
    }

    // Create a pending withdrawal request (requires admin approval)
    const withdrawalRequest = this.walletTransactionRepository.create({
      userId,
      amount,
      balanceAfter: balance.balance - amount,
      type: TransactionType.DEBIT,
      source: TransactionSource.WITHDRAWAL,
      description: `Withdrawal request to ${accountName} (${verifiedAccountNumber})`,
      status: 'pending', // Pending admin approval
      metadata: {
        accountNumber: verifiedAccountNumber,
        bankCode: request.bankCode,
        accountName,
        testMode: isTestMode,
      },
    });

    const saved = await this.walletTransactionRepository.save(withdrawalRequest);

    // Notify admins about the withdrawal request
    this.notificationsService.notify('withdrawal-request', saved, {
      userIds: [userId],
      roles: FINANCE_REVIEW_ROLES,
    });

    await this.notificationsService.sendNotification({
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal request of ₦${amount.toLocaleString()} is pending admin approval`,
      type: 'withdrawal_pending',
      userId,
      data: {
        withdrawalId: saved.id,
        amount,
        accountName,
      },
    });

    return {
      message: 'Withdrawal request submitted successfully. Awaiting admin approval.',
      requiresApproval: true,
      withdrawalRequest: saved,
    };
  }

  async createTransaction(data: Partial<WalletTransaction>): Promise<WalletTransaction> {
    const transaction = this.walletTransactionRepository.create(data);
    const saved = await this.walletTransactionRepository.save(transaction);
    this.notificationsService.notify('wallet-update', saved, {
      userIds: saved.userId ? [saved.userId] : undefined,
      roles: FINANCE_REVIEW_ROLES,
    });
    return saved;
  }

  async creditRecyclableEarnings(userId: string, recyclableId: string, amount: number): Promise<WalletTransaction | null> {
    if (!amount || amount <= 0) {
      return null;
    }

    const existingCredit = await this.walletTransactionRepository.findOne({
      where: {
        userId,
        referenceId: recyclableId,
        source: TransactionSource.RECYCLABLES,
        type: TransactionType.CREDIT,
      },
    });

    if (existingCredit) {
      return existingCredit;
    }

    const { balance } = await this.getBalanceByUser(userId);
    return this.createTransaction({
      userId,
      amount,
      balanceAfter: balance + amount,
      type: TransactionType.CREDIT,
      source: TransactionSource.RECYCLABLES,
      referenceId: recyclableId,
      description: 'Recyclables valuation payout',
    });
  }

  async getWithdrawalLimits(userId: string): Promise<{
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    dailyWithdrawn: number;
    remainingDaily: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTransactions = await this.walletTransactionRepository.find({
      where: {
        userId,
        type: TransactionType.DEBIT,
        source: TransactionSource.WITHDRAWAL,
        createdAt: Between(today, tomorrow),
      },
    });

    const dailyWithdrawn = todayTransactions
      .filter((tx) => BALANCE_AFFECTING_STATUSES.has(tx.status || 'approved'))
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      minAmount: this.minWithdrawal,
      maxAmount: this.maxWithdrawal,
      dailyLimit: this.dailyWithdrawalLimit,
      dailyWithdrawn,
      remainingDaily: Math.max(0, this.dailyWithdrawalLimit - dailyWithdrawn),
    };
  }

  async getTransactionSummary(userId: string): Promise<{
    totalCredits: number;
    totalDebits: number;
    netBalance: number;
    transactionCount: number;
    lastTransaction: Date | null;
  }> {
    const transactions = await this.findAllByUser(userId);
    
    const balanceTransactions = transactions.filter((tx) =>
      BALANCE_AFFECTING_STATUSES.has(tx.status || 'approved'),
    );

    const totalCredits = balanceTransactions
      .filter(tx => tx.type === TransactionType.CREDIT)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const totalDebits = balanceTransactions
      .filter(tx => tx.type === TransactionType.DEBIT)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      totalCredits: Math.round(totalCredits * 100) / 100,
      totalDebits: Math.round(totalDebits * 100) / 100,
      netBalance: Math.round((totalCredits - totalDebits) * 100) / 100,
      transactionCount: transactions.length,
      lastTransaction: transactions[0]?.createdAt || null,
    };
  }

  /**
   * Admin: Approve withdrawal request and process payment
   */
  async approveWithdrawal(withdrawalId: string, approvedBy: string): Promise<WalletTransaction> {
    const withdrawal = await this.walletTransactionRepository.findOne({
      where: { id: withdrawalId },
      relations: ['user'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new BadRequestException('Withdrawal request is not pending');
    }

    if (withdrawal.source !== TransactionSource.WITHDRAWAL) {
      throw new BadRequestException('Transaction is not a withdrawal request');
    }

    try {
      // Get account details from metadata
      const metadata = withdrawal.metadata as any;
      if (!metadata?.accountNumber || !metadata?.bankCode || !metadata?.accountName) {
        throw new BadRequestException('Withdrawal request missing account details');
      }

      // Check if test mode is enabled
      const isTestMode = process.env.PAYSTACK_TEST_MODE === 'true';

      if (isTestMode) {
        // Mock transfer for testing (Paystack starter accounts can't do transfers)
        const reference = `TEST-WD-${Date.now()}-${withdrawal.userId.slice(0, 8)}`;
        
        withdrawal.status = 'completed';
        withdrawal.externalTransactionId = reference;
        withdrawal.metadata = {
          ...metadata,
          approvedBy,
          approvedAt: new Date().toISOString(),
          transferCode: `TEST_${reference}`,
          transferReference: reference,
          testMode: true,
          note: 'Test mode - no actual transfer initiated',
        };

        const saved = await this.walletTransactionRepository.save(withdrawal);

        // Notify user
        await this.notificationsService.sendNotification({
          title: 'Withdrawal Approved (Test Mode)',
          message: `Your withdrawal of ₦${Number(withdrawal.amount).toLocaleString()} has been approved (test mode - no actual transfer)`,
          type: 'withdrawal_approved',
          userId: withdrawal.userId,
          data: {
            withdrawalId: saved.id,
            amount: withdrawal.amount,
            reference,
            testMode: true,
          },
        });

        // Send email confirmation
        if (withdrawal.user) {
          void this.notificationsService.sendWithdrawalConfirmationEmail(withdrawal.user, saved);
        }

        return saved;
      }

      // Production mode - actual Paystack transfer
      // Create transfer recipient
      const recipient = await this.paystackService.createTransferRecipient({
        accountNumber: metadata.accountNumber,
        bankCode: metadata.bankCode,
        accountName: metadata.accountName,
      });

      // Initiate transfer
      const reference = `ARMS-WD-${Date.now()}-${withdrawal.userId.slice(0, 8)}`;
      const transfer = await this.paystackService.initiateTransfer({
        amount: Number(withdrawal.amount),
        recipientCode: recipient.recipient_code,
        reason: 'ARMS wallet withdrawal',
        reference,
      });

      // Update withdrawal with transfer details
      withdrawal.status = 'completed';
      withdrawal.externalTransactionId = transfer.transfer_code || transfer.reference || String(transfer.id || reference);
      withdrawal.metadata = {
        ...metadata,
        approvedBy,
        approvedAt: new Date().toISOString(),
        transferCode: transfer.transfer_code,
        transferReference: transfer.reference,
      };

      const saved = await this.walletTransactionRepository.save(withdrawal);

      // Notify user
      await this.notificationsService.sendNotification({
        title: 'Withdrawal Approved',
        message: `Your withdrawal of ₦${Number(withdrawal.amount).toLocaleString()} has been approved and processed`,
        type: 'withdrawal_approved',
        userId: withdrawal.userId,
        data: {
          withdrawalId: saved.id,
          amount: withdrawal.amount,
          reference: transfer.reference,
        },
      });

      // Send email confirmation
      if (withdrawal.user) {
        void this.notificationsService.sendWithdrawalConfirmationEmail(withdrawal.user, saved);
      }

      return saved;
    } catch (error) {
      // Mark as failed
      withdrawal.status = 'failed';
      withdrawal.metadata = {
        ...(withdrawal.metadata as any),
        failureReason: error.message,
        failedAt: new Date().toISOString(),
      };
      await this.walletTransactionRepository.save(withdrawal);
      throw error;
    }
  }

  /**
   * Admin: Reject withdrawal request
   */
  async rejectWithdrawal(withdrawalId: string, reason: string, rejectedBy: string): Promise<WalletTransaction> {
    const withdrawal = await this.walletTransactionRepository.findOne({
      where: { id: withdrawalId },
      relations: ['user'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new BadRequestException('Withdrawal request is not pending');
    }

    if (withdrawal.source !== TransactionSource.WITHDRAWAL) {
      throw new BadRequestException('Transaction is not a withdrawal request');
    }

    // Update status to rejected
    withdrawal.status = 'rejected';
    withdrawal.metadata = {
      ...(withdrawal.metadata as any),
      rejectedBy,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
    };

    const saved = await this.walletTransactionRepository.save(withdrawal);

    // Notify user
    await this.notificationsService.sendNotification({
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request of ₦${Number(withdrawal.amount).toLocaleString()} was rejected: ${reason}`,
      type: 'withdrawal_rejected',
      userId: withdrawal.userId,
      data: {
        withdrawalId: saved.id,
        amount: withdrawal.amount,
        reason,
      },
    });

    return saved;
  }

  /**
   * Get pending withdrawal requests (for admin)
   */
  async getPendingWithdrawals(): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      where: {
        type: TransactionType.DEBIT,
        source: TransactionSource.WITHDRAWAL,
        status: 'pending',
      },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }
}
