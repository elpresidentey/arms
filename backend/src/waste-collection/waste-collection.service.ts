import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CollectionStatus, WasteCollection } from './entities/waste-collection.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

const COLLECTION_STAFF_ROLES = ['admin', 'psp_operator', 'ward_officer', 'supervisor', 'dispatcher'];

@Injectable()
export class WasteCollectionService {
  constructor(
    @InjectRepository(WasteCollection)
    private wasteCollectionRepository: Repository<WasteCollection>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<WasteCollection[]> {
    return this.wasteCollectionRepository.find({
      order: { scheduledDate: 'DESC' },
      relations: ['resident'],
    });
  }

  async findOne(id: string): Promise<WasteCollection> {
    const collection = await this.wasteCollectionRepository.findOne({
      where: { id },
      relations: ['resident'],
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }

  async findOneForUser(id: string, userId: string, role: string): Promise<WasteCollection> {
    const collection = await this.findOne(id);
    const canReviewOthers = ['admin', 'psp_operator', 'ward_officer', 'supervisor', 'dispatcher'].includes(role);
    if (!canReviewOthers && collection.residentId !== userId) {
      throw new ForbiddenException('You can only view your own collection');
    }
    return collection;
  }

  async verifyCollection(id: string): Promise<WasteCollection> {
    const collection = await this.findOne(id);
    collection.isVerified = true;
    collection.verificationTime = new Date();
    collection.status = CollectionStatus.VERIFIED;
    const saved = await this.wasteCollectionRepository.save(collection);
    this.notificationsService.notify('waste-collection-update', saved, {
      userIds: saved.residentId ? [saved.residentId] : undefined,
      roles: COLLECTION_STAFF_ROLES,
    });
    return saved;
  }

  async getStats(residentId?: string) {
    const collections = residentId ? await this.getMyCollections(residentId) : await this.findAll();
    const now = new Date();
    const thisMonth = collections.filter((collection) => {
      const createdAt = new Date(collection.createdAt);
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length;
    const lastPickup = collections.find((collection) => collection.actualCollectionTime)?.actualCollectionTime ?? null;

    return { lastPickup, thisMonth };
  }

  async create(data: Partial<WasteCollection>): Promise<WasteCollection> {
    const collection = this.wasteCollectionRepository.create(data);
    const saved = await this.wasteCollectionRepository.save(collection);
    this.notificationsService.notify('waste-collection-update', saved, {
      userIds: saved.residentId ? [saved.residentId] : undefined,
      roles: COLLECTION_STAFF_ROLES,
    });
    return saved;
  }

  async getMyCollections(residentId: string): Promise<WasteCollection[]> {
    return this.wasteCollectionRepository.find({
      where: { residentId },
      order: { scheduledDate: 'DESC' },
      relations: ['resident'],
    });
  }

  async scheduleCollection(residentId: string, scheduleData: { scheduledDate: string; notes?: string }): Promise<WasteCollection> {
    // Get user details for address
    const user = await this.usersService.findById(residentId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate scheduled date is in the future
    const inputDate = new Date(scheduleData.scheduledDate);
    if (isNaN(inputDate.getTime())) {
      throw new BadRequestException('Invalid scheduled date');
    }

    const scheduledDate = new Date(
      Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate(), 0, 0, 0, 0),
    );
    const scheduledDateEnd = new Date(
      Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate(), 23, 59, 59, 999),
    );
    const now = new Date();
    if (scheduledDate <= now) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    // Check if user already has a collection scheduled for that date
    const existingCollection = await this.wasteCollectionRepository.findOne({
      where: {
        residentId,
        scheduledDate: Between(scheduledDate, scheduledDateEnd),
        status: CollectionStatus.SCHEDULED,
      },
    });

    if (existingCollection) {
      throw new BadRequestException('You already have a collection scheduled for this date');
    }

    // Create new collection
    const collection = this.wasteCollectionRepository.create({
      residentId,
      scheduledDate,
      address: user.address || `${user.street}, ${user.houseNumber}`,
      ward: user.ward,
      street: user.street,
      latitude: user.latitude,
      longitude: user.longitude,
      notes: scheduleData.notes,
      status: CollectionStatus.SCHEDULED,
    });

    const saved = await this.wasteCollectionRepository.save(collection);
    this.notificationsService.notify('waste-collection-update', saved, {
      userIds: [residentId],
      roles: COLLECTION_STAFF_ROLES,
    });
    return saved;
  }

  async confirmCollection(collectionId: string, observedTruckCode: string, residentId: string): Promise<WasteCollection> {
    const collection = await this.wasteCollectionRepository.findOne({
      where: { id: collectionId },
      relations: ['resident'],
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.residentId !== residentId) {
      throw new ForbiddenException('You can only confirm your own collection');
    }

    if (collection.status !== CollectionStatus.IN_PROGRESS) {
      throw new BadRequestException('Collection must be in progress to confirm');
    }

    collection.residentConfirmed = true;
    collection.residentConfirmedAt = new Date();
    collection.reportedTruckCode = observedTruckCode;
    collection.status = CollectionStatus.COMPLETED;

    const saved = await this.wasteCollectionRepository.save(collection);
    this.notificationsService.notify('waste-collection-update', saved, {
      userIds: [residentId],
      roles: COLLECTION_STAFF_ROLES,
    });
    return saved;
  }
}
