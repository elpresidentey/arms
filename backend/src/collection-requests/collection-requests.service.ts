import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionRequest, CollectionRequestStatus, CollectionRequestType } from './entities/collection-request.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CollectionRequestsService {
  constructor(
    @InjectRepository(CollectionRequest)
    private collectionRequestRepository: Repository<CollectionRequest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Resident submits collection request
  async createRequest(
    userId: string,
    data: {
      type: CollectionRequestType;
      preferredDate?: Date;
      description?: string;
    },
  ): Promise<CollectionRequest> {
    const resident = await this.usersRepository.findOne({ where: { id: userId } });
    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    const request = this.collectionRequestRepository.create({
      residentId: userId,
      address: resident.address,
      ward: resident.ward,
      street: resident.street,
      latitude: resident.latitude,
      longitude: resident.longitude,
      type: data.type || CollectionRequestType.ROUTINE,
      status: CollectionRequestStatus.PENDING,
      preferredDate: data.preferredDate,
      description: data.description,
    });

    const saved = await this.collectionRequestRepository.save(request);

    // Notify admins
    await this.notificationsService.notify('collection-request-created', saved, {
      roles: ['admin', 'psp_operator', 'ward_officer'],
    });

    return saved;
  }

  // Get pending requests for admin
  async getPendingRequests(): Promise<CollectionRequest[]> {
    return this.collectionRequestRepository.find({
      where: { status: CollectionRequestStatus.PENDING },
      relations: ['resident'],
      order: { createdAt: 'ASC' },
    });
  }

  // Get all requests with optional filtering
  async getAllRequests(status?: CollectionRequestStatus): Promise<CollectionRequest[]> {
    const query = this.collectionRequestRepository.createQueryBuilder('cr').leftJoinAndSelect('cr.resident', 'resident');

    if (status) {
      query.where('cr.status = :status', { status });
    }

    return query.orderBy('cr.createdAt', 'DESC').getMany();
  }

  // Get resident's requests
  async getMyRequests(userId: string): Promise<CollectionRequest[]> {
    return this.collectionRequestRepository.find({
      where: { residentId: userId },
      relations: ['route'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get single request
  async getOne(id: string): Promise<CollectionRequest> {
    const request = await this.collectionRequestRepository.findOne({
      where: { id },
      relations: ['resident', 'route'],
    });

    if (!request) {
      throw new NotFoundException('Collection request not found');
    }

    return request;
  }

  async getOneForUser(id: string, userId: string, userRole: string): Promise<CollectionRequest> {
    const request = await this.getOne(id);
    const staffRoles = ['admin', 'psp_operator', 'ward_officer'];

    if (userRole === 'resident' && request.residentId !== userId) {
      throw new ForbiddenException('You can only view your own collection requests');
    }

    if (userRole !== 'resident' && !staffRoles.includes(userRole)) {
      throw new ForbiddenException('Collection request access is restricted');
    }

    return request;
  }

  // Admin schedules request to a route
  async scheduleRequest(
    requestId: string,
    routeId: string,
    scheduledDate: Date,
  ): Promise<CollectionRequest> {
    const request = await this.getOne(requestId);

    if (request.status !== CollectionRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be scheduled');
    }

    request.routeId = routeId;
    request.scheduledDate = scheduledDate;
    request.status = CollectionRequestStatus.SCHEDULED;

    const saved = await this.collectionRequestRepository.save(request);

    // Notify resident
    await this.notificationsService.sendNotification({
      title: 'Collection Scheduled',
      message: `Your collection request has been scheduled for ${scheduledDate.toLocaleDateString()}`,
      type: 'collection_scheduled',
      userId: request.residentId,
      data: saved,
    });

    return saved;
  }

  // Mark request as completed
  async completeRequest(requestId: string): Promise<CollectionRequest> {
    const request = await this.getOne(requestId);

    if (request.status !== CollectionRequestStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled requests can be completed');
    }

    request.status = CollectionRequestStatus.COMPLETED;
    request.completedAt = new Date();

    const saved = await this.collectionRequestRepository.save(request);

    // Notify resident
    await this.notificationsService.sendNotification({
      title: 'Collection Completed',
      message: 'Your collection request has been completed',
      type: 'collection_completed',
      userId: request.residentId,
      data: saved,
    });

    return saved;
  }

  // Cancel request
  async cancelRequest(requestId: string, userId: string, userRole: string): Promise<CollectionRequest> {
    const request = await this.getOne(requestId);

    // Residents can only cancel their own requests
    if (userRole === 'resident' && request.residentId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    const staffRoles = ['admin', 'psp_operator', 'ward_officer'];
    if (userRole !== 'resident' && !staffRoles.includes(userRole)) {
      throw new ForbiddenException('Collection request cancellation is restricted');
    }

    if (request.status === CollectionRequestStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed request');
    }

    request.status = CollectionRequestStatus.CANCELLED;
    return this.collectionRequestRepository.save(request);
  }

  // Get statistics
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    byType: Record<string, number>;
  }> {
    const requests = await this.collectionRequestRepository.find();

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === CollectionRequestStatus.PENDING).length,
      scheduled: requests.filter((r) => r.status === CollectionRequestStatus.SCHEDULED).length,
      completed: requests.filter((r) => r.status === CollectionRequestStatus.COMPLETED).length,
      cancelled: requests.filter((r) => r.status === CollectionRequestStatus.CANCELLED).length,
      byType: {
        routine: requests.filter((r) => r.type === CollectionRequestType.ROUTINE).length,
        urgent: requests.filter((r) => r.type === CollectionRequestType.URGENT).length,
        bulky: requests.filter((r) => r.type === CollectionRequestType.BULKY).length,
        special: requests.filter((r) => r.type === CollectionRequestType.SPECIAL).length,
      },
    };
  }
}
