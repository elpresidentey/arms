import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recyclable, RecyclableStatus, RecyclableType } from './entities/recyclable.entity';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';

const RECYCLABLE_STAFF_ROLES = ['admin', 'recycler', 'supervisor', 'dispatcher'];

@Injectable()
export class RecyclablesService {
  constructor(
    @InjectRepository(Recyclable)
    private recyclablesRepository: Repository<Recyclable>,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<Recyclable[]> {
    return this.recyclablesRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async create(data: Partial<Recyclable>): Promise<Recyclable> {
    const recyclable = this.recyclablesRepository.create({
      ...data,
      status: data.status || RecyclableStatus.LOGGED,
      unit: data.unit || 'kg',
    });
    const saved = await this.recyclablesRepository.save(recyclable);
    this.notificationsService.notify('recyclable-update', saved, {
      userIds: saved.userId ? [saved.userId] : undefined,
      roles: RECYCLABLE_STAFF_ROLES,
    });
    return saved;
  }

  async findOne(id: string): Promise<Recyclable> {
    const recyclable = await this.recyclablesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!recyclable) {
      throw new NotFoundException('Recyclable not found');
    }
    return recyclable;
  }

  async update(id: string, data: Partial<Recyclable>): Promise<Recyclable> {
    const recyclable = await this.findOne(id);
    Object.assign(recyclable, data);
    const saved = await this.recyclablesRepository.save(recyclable);

    if (saved.status === RecyclableStatus.PAID) {
      await this.walletService.creditRecyclableEarnings(
        saved.userId,
        saved.id,
        Number(saved.actualValue || saved.estimatedValue || 0),
      );
    }

    this.notificationsService.notify('recyclable-update', saved, {
      userIds: saved.userId ? [saved.userId] : undefined,
      roles: RECYCLABLE_STAFF_ROLES,
    });
    return saved;
  }

  async requestPickup(id: string): Promise<Recyclable> {
    return this.update(id, { status: RecyclableStatus.PICKUP_REQUESTED });
  }

  async requestPickupForUser(id: string, userId: string): Promise<Recyclable> {
    const recyclable = await this.findOne(id);
    if (recyclable.userId !== userId) {
      throw new ForbiddenException('You can only request pickup for your own recyclable item');
    }
    return this.update(id, { status: RecyclableStatus.PICKUP_REQUESTED });
  }

  // Valuation logic for different recyclable types (prices per kg)
  private getRecyclablePricing(): Record<RecyclableType, number> {
    return {
      [RecyclableType.PLASTIC_BOTTLES]: 0.50, // $0.50 per kg
      [RecyclableType.GLASS_BOTTLES]: 0.30, // $0.30 per kg
      [RecyclableType.ALUMINUM_CANS]: 1.20, // $1.20 per kg
      [RecyclableType.CARDBOARD]: 0.25, // $0.25 per kg
      [RecyclableType.PAPER]: 0.40, // $0.40 per kg
      [RecyclableType.METAL_SCRAPS]: 0.80, // $0.80 per kg
      [RecyclableType.ELECTRONICS]: 2.50, // $2.50 per kg
      [RecyclableType.OTHER]: 0.20, // $0.20 per kg
    };
  }

  calculateEstimatedValue(type: RecyclableType, quantity: number): number {
    const pricing = this.getRecyclablePricing();
    const pricePerKg = pricing[type] || 0.20; // Default to $0.20 per kg
    return Math.round(quantity * pricePerKg * 100) / 100; // Round to 2 decimal places
  }

  async getMyRecyclables(userId: string): Promise<Recyclable[]> {
    return this.recyclablesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async createWithValuation(data: Partial<Recyclable>): Promise<Recyclable> {
    // Calculate estimated value based on type and quantity
    if (data.type && data.quantity) {
      data.estimatedValue = this.calculateEstimatedValue(data.type, Number(data.quantity));
    }

    const recyclable = this.recyclablesRepository.create({
      ...data,
      status: data.status || RecyclableStatus.LOGGED,
      unit: data.unit || 'kg',
    });
    const saved = await this.recyclablesRepository.save(recyclable);
    this.notificationsService.notify('recyclable-update', saved, {
      userIds: saved.userId ? [saved.userId] : undefined,
      roles: RECYCLABLE_STAFF_ROLES,
    });
    return saved;
  }

  async getValuationSummary(userId: string): Promise<{
    totalEstimated: number;
    totalActual: number;
    pendingItems: number;
    paidItems: number;
  }> {
    const userRecyclables = await this.getMyRecyclables(userId);
    
    const totalEstimated = userRecyclables.reduce((sum, item) => sum + Number(item.estimatedValue), 0);
    const totalActual = userRecyclables.reduce((sum, item) => sum + (Number(item.actualValue) || 0), 0);
    const pendingItems = userRecyclables.filter(item => item.status !== RecyclableStatus.PAID).length;
    const paidItems = userRecyclables.filter(item => item.status === RecyclableStatus.PAID).length;

    return {
      totalEstimated: Math.round(totalEstimated * 100) / 100,
      totalActual: Math.round(totalActual * 100) / 100,
      pendingItems,
      paidItems,
    };
  }
}
