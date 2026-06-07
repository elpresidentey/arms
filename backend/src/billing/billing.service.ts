import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Bill, BillStatus, PropertyType } from './entities/bill.entity';
import { BillPayment, PaymentStatus } from './entities/bill-payment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { PaystackService } from '../paystack/paystack.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly gracePeriodDays = 7;

  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(BillPayment)
    private readonly paymentRepository: Repository<BillPayment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Generate monthly bills for all active users
   */
  async generateMonthlyBills(billingPeriod?: string): Promise<Bill[]> {
    const period = billingPeriod || this.getCurrentBillingPeriod();
    const users = await this.userRepository.find({
      where: { isActive: true, role: UserRole.RESIDENT },
    });

    const bills: Bill[] = [];

    for (const user of users) {
      const existingBill = await this.billRepository.findOne({
        where: { userId: user.id, billingPeriod: period },
      });

      if (existingBill) {
        continue;
      }

      bills.push(await this.createMonthlyBill(user, period));
    }

    return bills;
  }

  /**
   * Get all bills for a user
   */
  async getUserBills(userId: string): Promise<Bill[]> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    try {
      await this.syncUserBillStatuses(userId);
      const bills = await this.billRepository.find({
        where: { userId },
        order: { billingPeriod: 'DESC', createdAt: 'DESC' },
      });
      return bills.map((bill) => this.normalizeBill(bill));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to load bills for user ${userId}: ${message}`);

      if (message.includes('relation') && message.includes('bills')) {
        throw new InternalServerErrorException(
          'Billing tables are not installed. Run: npm run apply:billing',
        );
      }

      throw error;
    }
  }

  private normalizeBill(bill: Bill): Bill {
    return {
      ...bill,
      amount: Number(bill.amount),
      lateFee: Number(bill.lateFee),
      totalAmount: Number(bill.totalAmount),
    };
  }

  /**
   * Get a single bill
   */
  async getBill(id: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return this.normalizeBill(bill);
  }

  /**
   * Get all bills (admin)
   */
  async getAllBills(status?: BillStatus): Promise<Bill[]> {
    const where = status ? { status } : {};
    const bills = await this.billRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return bills.map((bill) => this.normalizeBill(bill));
  }

  /**
   * Sync pending bills for one resident (late fees + overdue status after grace period).
   */
  async syncUserBillStatuses(userId: string): Promise<void> {
    const now = new Date();
    const pendingBills = await this.billRepository.find({
      where: { userId, status: BillStatus.PENDING },
    });

    for (const bill of pendingBills) {
      await this.applyOverdueRules(bill, now);
    }
  }

  private async applyOverdueRules(bill: Bill, now = new Date()): Promise<Bill> {
    if (bill.status !== BillStatus.PENDING) {
      return bill;
    }

    const daysPastDue = Math.floor(
      (now.getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysPastDue <= this.gracePeriodDays) {
      return bill;
    }

    if (Number(bill.lateFee) === 0) {
      bill.lateFee = Number(bill.amount) * 0.1;
      bill.totalAmount = Number(bill.amount) + bill.lateFee;
    }

    bill.status = BillStatus.OVERDUE;
    return this.billRepository.save(bill);
  }

  /**
   * Calculate and apply late fees to overdue bills (all users, admin job).
   */
  async applyLateFees(): Promise<Bill[]> {
    const now = new Date();
    const overdueBills = await this.billRepository.find({
      where: {
        status: BillStatus.PENDING,
        dueDate: LessThan(now),
      },
    });

    const updatedBills: Bill[] = [];

    for (const bill of overdueBills) {
      const updated = await this.applyOverdueRules(bill, now);
      if (updated.status === BillStatus.OVERDUE) {
        updatedBills.push(updated);
      }
    }

    return updatedBills;
  }

  /**
   * Initiate payment for a bill
   */
  async initiatePayment(billId: string, userId: string, email: string) {
    const rawBill = await this.billRepository.findOne({ where: { id: billId } });
    if (!rawBill) {
      throw new NotFoundException('Bill not found');
    }
    if (rawBill.userId !== userId) {
      throw new BadRequestException('This bill does not belong to you');
    }
    if (rawBill.status === BillStatus.PENDING) {
      await this.applyOverdueRules(rawBill);
    }

    const bill = await this.getBill(billId);

    if (bill.userId !== userId) {
      throw new BadRequestException('This bill does not belong to you');
    }

    if (bill.status === BillStatus.PAID) {
      throw new BadRequestException('This bill has already been paid');
    }

    if (bill.status === BillStatus.CANCELLED) {
      throw new BadRequestException('This bill has been cancelled');
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      billId: bill.id,
      userId,
      amount: bill.totalAmount,
      paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paymentMethod: 'paystack',
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Initialize Paystack transaction
    const paystackResponse = await this.paystackService.initializeTransaction({
      email,
      amount: bill.totalAmount * 100, // Convert to kobo
      reference: savedPayment.paymentReference,
      callback_url: `${process.env.FRONTEND_URL}/app/payment/verify`,
      metadata: {
        billId: bill.id,
        billNumber: bill.billNumber,
        billingPeriod: bill.billingPeriod,
        paymentId: savedPayment.id,
      },
    });

    // Update payment with Paystack details
    savedPayment.paystackReference = paystackResponse.reference;
    savedPayment.paystackAccessCode = paystackResponse.access_code;
    await this.paymentRepository.save(savedPayment);

    return {
      payment: savedPayment,
      authorizationUrl: paystackResponse.authorization_url,
      accessCode: paystackResponse.access_code,
      reference: paystackResponse.reference,
    };
  }

  /**
   * Verify and complete payment
   */
  async verifyPayment(reference: string): Promise<BillPayment & { bill?: Bill }> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentReference: reference },
      relations: ['bill'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify with Paystack
    const verification = await this.paystackService.verifyTransaction(reference);

    if (verification.status === 'success') {
      payment.status = PaymentStatus.SUCCESS;
      payment.metadata = verification;
      await this.paymentRepository.save(payment);

      // Update bill status
      const bill = await this.getBill(payment.billId);
      bill.status = BillStatus.PAID;
      bill.paidAt = new Date();
      bill.paymentReference = reference;
      bill.paymentMethod = 'paystack';
      await this.billRepository.save(bill);

      return { ...payment, bill };
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.metadata = verification;
      await this.paymentRepository.save(payment);

      return payment;
    }
  }

  /**
   * Get all bill payments (admin oversight)
   */
  async getAllPayments(status?: string): Promise<BillPayment[]> {
    const where = status ? { status: status as PaymentStatus } : {};
    const payments = await this.paymentRepository.find({
      where,
      relations: ['bill', 'user'],
      order: { createdAt: 'DESC' },
    });
    return payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }));
  }

  /**
   * Admin approves a pending payment and marks the bill paid
   */
  async approvePayment(paymentId: string, adminUserId: string): Promise<BillPayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['bill'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be approved');
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.metadata = {
      ...(payment.metadata || {}),
      approvedBy: adminUserId,
      approvedAt: new Date().toISOString(),
      approvalType: 'admin',
    };
    await this.paymentRepository.save(payment);

    const bill = await this.getBill(payment.billId);
    bill.status = BillStatus.PAID;
    bill.paidAt = new Date();
    bill.paymentReference = payment.paymentReference;
    bill.paymentMethod = payment.paymentMethod || 'admin_approved';
    await this.billRepository.save(bill);

    return { ...payment, amount: Number(payment.amount), bill };
  }

  /**
   * Admin rejects a pending payment
   */
  async rejectPayment(
    paymentId: string,
    adminUserId: string,
    reason?: string,
  ): Promise<BillPayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['bill'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be rejected');
    }

    payment.status = PaymentStatus.FAILED;
    payment.metadata = {
      ...(payment.metadata || {}),
      rejectedBy: adminUserId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || 'Rejected by administrator',
    };
    await this.paymentRepository.save(payment);

    return { ...payment, amount: Number(payment.amount) };
  }

  /**
   * List active residents for admin bill issuance (searchable).
   */
  async listResidentsForBilling(search?: string) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.ward',
        'user.street',
        'user.houseNumber',
        'user.propertyType',
      ])
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('user.role = :role', { role: UserRole.RESIDENT })
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('user.firstName', 'ASC');

    const term = search?.trim().toLowerCase();
    if (term) {
      qb.andWhere(
        `(LOWER(user.firstName) LIKE :term
          OR LOWER(user.lastName) LIKE :term
          OR LOWER(user.email) LIKE :term
          OR LOWER(COALESCE(user.ward, '')) LIKE :term
          OR LOWER(user.street) LIKE :term
          OR LOWER(COALESCE(user.houseNumber, '')) LIKE :term)`,
        { term: `%${term}%` },
      );
    }

    return qb.getMany();
  }

  /**
   * Issue a monthly bill to a single resident (admin)
   */
  async issueBillForUser(userId: string, billingPeriod?: string): Promise<Bill> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Resident not found');
    }
    if (user.role !== UserRole.RESIDENT) {
      throw new BadRequestException('Bills can only be issued to resident accounts');
    }

    const period = billingPeriod || this.getCurrentBillingPeriod();
    const existing = await this.billRepository.findOne({
      where: { userId, billingPeriod: period },
    });

    if (existing) {
      throw new BadRequestException(
        `A bill already exists for this resident for ${period}`,
      );
    }

    return this.createMonthlyBill(user, period);
  }

  async getStatistics() {
    const bills = await this.billRepository.find();

    const stats = {
      totalBills: bills.length,
      pending: bills.filter((b) => b.status === BillStatus.PENDING).length,
      paid: bills.filter((b) => b.status === BillStatus.PAID).length,
      overdue: bills.filter((b) => b.status === BillStatus.OVERDUE).length,
      totalRevenue: bills
        .filter((b) => b.status === BillStatus.PAID)
        .reduce((sum, b) => sum + Number(b.totalAmount), 0),
      pendingRevenue: bills
        .filter((b) => b.status === BillStatus.PENDING || b.status === BillStatus.OVERDUE)
        .reduce((sum, b) => sum + Number(b.totalAmount), 0),
    };

    return stats;
  }

  private async generateBillNumber(period: string): Promise<string> {
    const count = await this.billRepository.count({ where: { billingPeriod: period } });
    const sequence = (count + 1).toString().padStart(4, '0');
    return `BILL-${period}-${sequence}`;
  }

  /**
   * Generate monthly bill for a specific user (used by scheduler)
   */
  async generateMonthlyBill(userId: string): Promise<Bill> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true, role: UserRole.RESIDENT },
    });

    if (!user) {
      throw new NotFoundException('User not found or not eligible for billing');
    }

    const period = this.getCurrentBillingPeriod();
    const existingBill = await this.billRepository.findOne({
      where: { userId: user.id, billingPeriod: period },
    });

    if (existingBill) {
      this.logger.warn(`Bill already exists for user ${userId} in period ${period}`);
      return existingBill;
    }

    return this.createMonthlyBill(user, period);
  }

  private async createMonthlyBill(user: User, period: string): Promise<Bill> {
    const propertyType = this.getBillPropertyType(user);
    const amount = this.getMonthlyRate(propertyType);

    const bill = this.billRepository.create({
      billNumber: await this.generateBillNumber(period),
      userId: user.id,
      billingPeriod: period,
      propertyType,
      amount,
      lateFee: 0,
      totalAmount: amount,
      status: BillStatus.PENDING,
      dueDate: this.calculateDueDate(period),
    });

    const saved = await this.billRepository.save(bill);
    return this.normalizeBill(saved);
  }

  private getBillPropertyType(user: User): PropertyType {
    return user.propertyType === 'commercial'
      ? PropertyType.COMMERCIAL
      : PropertyType.RESIDENTIAL;
  }

  private getMonthlyRate(propertyType: PropertyType): number {
    return propertyType === PropertyType.COMMERCIAL ? 3500 : 2000;
  }

  private getCurrentBillingPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  private calculateDueDate(period: string): Date {
    const [year, month] = period.split('-').map(Number);
    const lastDayOfMonth = new Date(year, month, 0);
    const dueDate = new Date(lastDayOfMonth);
    dueDate.setDate(dueDate.getDate() + 7); // 7 days after month end
    return dueDate;
  }
}
