import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutRequest, PayoutStatus, PayoutType } from './entities/payout-request.entity';
import { User } from '../users/entities/user.entity';
import { PaystackService } from '../paystack/paystack.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(
    @InjectRepository(PayoutRequest)
    private payoutRequestRepository: Repository<PayoutRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private paystackService: PaystackService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a payout request
   */
  async createPayoutRequest(
    userId: string,
    amount: number,
    type: PayoutType = PayoutType.WALLET_WITHDRAWAL,
    notes?: string,
  ): Promise<PayoutRequest> {
    // Validate user has bank details
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isBankVerified || !user.paystackRecipientCode) {
      throw new BadRequestException('Bank details must be verified before requesting payout');
    }

    // Check minimum payout amount (e.g., 1000)
    if (amount < 1000) {
      throw new BadRequestException('Minimum payout amount is 1000');
    }

    // Check if user has sufficient balance for wallet withdrawal
    if (type === PayoutType.WALLET_WITHDRAWAL) {
      // TODO: Check user's wallet balance
      // const walletBalance = await this.walletService.getBalance(userId);
      // if (walletBalance < amount) {
      //   throw new BadRequestException('Insufficient wallet balance');
      // }
    }

    const payoutRequest = this.payoutRequestRepository.create({
      user,
      userId,
      amount,
      type,
      notes,
      status: PayoutStatus.PENDING,
    });

    const savedRequest = await this.payoutRequestRepository.save(payoutRequest);

    // Notify finance officers
    await this.notificationsService.sendNotification({
      title: 'New Payout Request',
      message: `${user.firstName} ${user.lastName} requested ₦${amount.toLocaleString()} payout`,
      type: 'payout_request',
      data: {
        payoutRequestId: savedRequest.id,
        userId,
        amount,
      },
    });

    this.logger.log(`Payout request created: ${savedRequest.id} for user ${userId}`);
    return savedRequest;
  }

  /**
   * Get all payout requests (for finance officers)
   */
  async getAllPayoutRequests(status?: PayoutStatus): Promise<PayoutRequest[]> {
    const queryBuilder = this.payoutRequestRepository.createQueryBuilder('payout')
      .leftJoinAndSelect('payout.user', 'user')
      .orderBy('payout.createdAt', 'DESC');

    if (status) {
      queryBuilder.where('payout.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  /**
   * Get user's payout requests
   */
  async getUserPayoutRequests(userId: string): Promise<PayoutRequest[]> {
    return this.payoutRequestRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Approve a payout request
   */
  async approvePayoutRequest(
    payoutRequestId: string,
    approvedBy: string,
  ): Promise<PayoutRequest> {
    const payoutRequest = await this.payoutRequestRepository.findOne({
      where: { id: payoutRequestId },
      relations: ['user'],
    });

    if (!payoutRequest) {
      throw new NotFoundException('Payout request not found');
    }

    if (payoutRequest.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Payout request is not pending');
    }

    // Update status to approved
    payoutRequest.status = PayoutStatus.APPROVED;
    payoutRequest.processedBy = approvedBy;
    payoutRequest.processedAt = new Date();

    await this.payoutRequestRepository.save(payoutRequest);

    // Notify user
    await this.notificationsService.sendNotification({
      title: 'Payout Request Approved',
      message: `Your payout request of ₦${payoutRequest.amount.toLocaleString()} has been approved`,
      type: 'payout_approved',
      userId: payoutRequest.userId,
      data: {
        payoutRequestId: payoutRequest.id,
        amount: payoutRequest.amount,
      },
    });

    this.logger.log(`Payout request approved: ${payoutRequestId} by ${approvedBy}`);
    return payoutRequest;
  }

  /**
   * Process payout (initiate transfer)
   */
  async processPayout(payoutRequestId: string): Promise<PayoutRequest> {
    const payoutRequest = await this.payoutRequestRepository.findOne({
      where: { id: payoutRequestId },
      relations: ['user'],
    });

    if (!payoutRequest) {
      throw new NotFoundException('Payout request not found');
    }

    if (payoutRequest.status !== PayoutStatus.APPROVED) {
      throw new BadRequestException('Payout request must be approved first');
    }

    try {
      // Initiate transfer via Paystack
      const transferResult = await this.paystackService.initiateTransfer(
        'balance',
        payoutRequest.amount,
        payoutRequest.user.paystackRecipientCode,
        `ARMS Payout - ${payoutRequest.type.replace(/_/g, ' ').toUpperCase()}`,
      );

      if (transferResult.status) {
        // Update payout request with transfer details
        payoutRequest.status = PayoutStatus.PROCESSING;
        payoutRequest.transferReference = transferResult.data.reference;
        payoutRequest.transferCode = transferResult.data.transfer_code;
        payoutRequest.paystackReference = transferResult.data.reference;

        await this.payoutRequestRepository.save(payoutRequest);

        // Notify user
        await this.notificationsService.sendNotification({
          title: 'Payout Processing',
          message: `Your payout of ₦${payoutRequest.amount.toLocaleString()} is being processed`,
          type: 'payout_processing',
          userId: payoutRequest.userId,
          data: {
            payoutRequestId: payoutRequest.id,
            transferReference: transferResult.data.reference,
          },
        });

        this.logger.log(`Payout processing initiated: ${payoutRequestId} - ${transferResult.data.reference}`);
        return payoutRequest;
      } else {
        throw new Error(transferResult.message);
      }
    } catch (error) {
      payoutRequest.status = PayoutStatus.FAILED;
      payoutRequest.failureReason = error.message;
      await this.payoutRequestRepository.save(payoutRequest);

      this.logger.error(`Payout processing failed: ${payoutRequestId} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Check and update payout status
   */
  async updatePayoutStatus(payoutRequestId: string): Promise<PayoutRequest> {
    const payoutRequest = await this.payoutRequestRepository.findOne({
      where: { id: payoutRequestId },
      relations: ['user'],
    });

    if (!payoutRequest) {
      throw new NotFoundException('Payout request not found');
    }

    if (!payoutRequest.transferReference) {
      throw new BadRequestException('No transfer reference found');
    }

    try {
      const status = await this.paystackService.getTransferStatus(payoutRequest.transferReference);

      if (status === 'success') {
        payoutRequest.status = PayoutStatus.COMPLETED;
        payoutRequest.completedAt = new Date();

        // Notify user
        await this.notificationsService.sendNotification({
          title: 'Payout Completed',
          message: `Your payout of ₦${payoutRequest.amount.toLocaleString()} has been completed successfully`,
          type: 'payout_completed',
          userId: payoutRequest.userId,
          data: {
            payoutRequestId: payoutRequest.id,
            amount: payoutRequest.amount,
          },
        });
      } else if (status === 'failed') {
        payoutRequest.status = PayoutStatus.FAILED;
        payoutRequest.failureReason = 'Transfer failed';

        // Notify user
        await this.notificationsService.sendNotification({
          title: 'Payout Failed',
          message: `Your payout of ₦${payoutRequest.amount.toLocaleString()} failed. Please contact support`,
          type: 'payout_failed',
          userId: payoutRequest.userId,
          data: {
            payoutRequestId: payoutRequest.id,
            amount: payoutRequest.amount,
          },
        });
      }

      await this.payoutRequestRepository.save(payoutRequest);
      return payoutRequest;
    } catch (error) {
      this.logger.error(`Failed to update payout status: ${payoutRequestId} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Reject payout request
   */
  async rejectPayoutRequest(
    payoutRequestId: string,
    reason: string,
    rejectedBy: string,
  ): Promise<PayoutRequest> {
    const payoutRequest = await this.payoutRequestRepository.findOne({
      where: { id: payoutRequestId },
      relations: ['user'],
    });

    if (!payoutRequest) {
      throw new NotFoundException('Payout request not found');
    }

    if (payoutRequest.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Payout request is not pending');
    }

    payoutRequest.status = PayoutStatus.REJECTED;
    payoutRequest.failureReason = reason;
    payoutRequest.processedBy = rejectedBy;
    payoutRequest.processedAt = new Date();

    await this.payoutRequestRepository.save(payoutRequest);

    // Notify user
    await this.notificationsService.sendNotification({
      title: 'Payout Request Rejected',
      message: `Your payout request of ₦${payoutRequest.amount.toLocaleString()} has been rejected: ${reason}`,
      type: 'payout_rejected',
      userId: payoutRequest.userId,
      data: {
        payoutRequestId: payoutRequest.id,
        amount: payoutRequest.amount,
        reason,
      },
    });

    this.logger.log(`Payout request rejected: ${payoutRequestId} by ${rejectedBy} - ${reason}`);
    return payoutRequest;
  }

  /**
   * Get payout statistics
   */
  async getPayoutStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    processing: number;
    completed: number;
    failed: number;
    rejected: number;
    totalAmount: number;
  }> {
    const stats = await this.payoutRequestRepository
      .createQueryBuilder('payout')
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN payout.status = :pending THEN 1 ELSE 0 END) as pending',
        'SUM(CASE WHEN payout.status = :approved THEN 1 ELSE 0 END) as approved',
        'SUM(CASE WHEN payout.status = :processing THEN 1 ELSE 0 END) as processing',
        'SUM(CASE WHEN payout.status = :completed THEN 1 ELSE 0 END) as completed',
        'SUM(CASE WHEN payout.status = :failed THEN 1 ELSE 0 END) as failed',
        'SUM(CASE WHEN payout.status = :rejected THEN 1 ELSE 0 END) as rejected',
        'SUM(payout.amount) as totalAmount',
      ])
      .setParameters({
        pending: PayoutStatus.PENDING,
        approved: PayoutStatus.APPROVED,
        processing: PayoutStatus.PROCESSING,
        completed: PayoutStatus.COMPLETED,
        failed: PayoutStatus.FAILED,
        rejected: PayoutStatus.REJECTED,
      })
      .getRawOne();

    return {
      total: parseInt(stats.total) || 0,
      pending: parseInt(stats.pending) || 0,
      approved: parseInt(stats.approved) || 0,
      processing: parseInt(stats.processing) || 0,
      completed: parseInt(stats.completed) || 0,
      failed: parseInt(stats.failed) || 0,
      rejected: parseInt(stats.rejected) || 0,
      totalAmount: parseFloat(stats.totalAmount) || 0,
    };
  }
}
