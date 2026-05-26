import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceRequest,
  ServiceRequestPriority,
  ServiceRequestStatus,
  ServiceRequestType,
} from './entities/service-request.entity';
import { NotificationsService } from '../notifications/notifications.service';

const SERVICE_REQUEST_STAFF_ROLES = ['admin', 'psp_operator', 'ward_officer', 'supervisor', 'dispatcher'];

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestsRepository: Repository<ServiceRequest>,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<ServiceRequest[]> {
    return this.serviceRequestsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['resident', 'assignedTo'],
    });
  }

  async findMine(userId: string): Promise<ServiceRequest[]> {
    return this.serviceRequestsRepository.find({
      where: { residentId: userId },
      order: { createdAt: 'DESC' },
      relations: ['resident', 'assignedTo'],
    });
  }

  async findOne(id: string): Promise<ServiceRequest> {
    const request = await this.serviceRequestsRepository.findOne({
      where: { id },
      relations: ['resident', 'assignedTo'],
    });
    
    if (!request) {
      throw new NotFoundException('Service request not found');
    }
    
    return request;
  }

  async create(data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const request = this.serviceRequestsRepository.create({
      ...data,
      requestNumber: this.createRequestNumber(),
      status: data.status || ServiceRequestStatus.SUBMITTED,
      priority: data.priority || ServiceRequestPriority.MEDIUM,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
      slaDueAt: this.calculateSlaDueDate(
        data.priority || ServiceRequestPriority.MEDIUM,
        data.type || ServiceRequestType.MISSED_PICKUP_FOLLOW_UP,
      ),
    });

    const saved = await this.serviceRequestsRepository.save(request);
    this.notificationsService.notify('service-request-update', saved, {
      userIds: saved.residentId ? [saved.residentId] : undefined,
      roles: SERVICE_REQUEST_STAFF_ROLES,
    });
    const requestWithResident = await this.serviceRequestsRepository.findOne({
      where: { id: saved.id },
      relations: ['resident'],
    });
    if (requestWithResident?.resident) {
      void this.notificationsService.sendServiceRequestUpdateEmail(requestWithResident.resident, requestWithResident);
    }
    return saved;
  }

  async update(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const request = await this.serviceRequestsRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    const previousStatus = request.status;
    Object.assign(request, {
      ...data,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : request.scheduledFor,
    });

    if (data.status === ServiceRequestStatus.COMPLETED && !request.completedAt) {
      request.completedAt = new Date();
    }

    if (data.status === ServiceRequestStatus.ESCALATED) {
      request.priority = ServiceRequestPriority.URGENT;
    }

    const saved = await this.serviceRequestsRepository.save(request);
    this.notificationsService.notify('service-request-update', saved, {
      userIds: saved.residentId ? [saved.residentId] : undefined,
      roles: SERVICE_REQUEST_STAFF_ROLES,
    });
    if (saved.status === ServiceRequestStatus.COMPLETED && previousStatus !== ServiceRequestStatus.COMPLETED) {
      await this.notificationsService.sendNotification({
        title: 'Service request completed',
        message: `${saved.requestNumber} has been carried out successfully${saved.resolutionNotes ? `: ${saved.resolutionNotes}` : '.'}`,
        type: 'service_request_completed',
        userId: saved.residentId,
        data: saved,
      });
    }
    const requestWithResident = await this.serviceRequestsRepository.findOne({
      where: { id: saved.id },
      relations: ['resident'],
    });
    if (requestWithResident?.resident) {
      void this.notificationsService.sendServiceRequestUpdateEmail(requestWithResident.resident, requestWithResident);
    }
    return saved;
  }

  async getSummary(userId?: string) {
    const requests = userId ? await this.findMine(userId) : await this.findAll();
    const openStatuses = [
      ServiceRequestStatus.SUBMITTED,
      ServiceRequestStatus.TRIAGED,
      ServiceRequestStatus.SCHEDULED,
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.ESCALATED,
    ];
    const now = new Date();

    return {
      totalRequests: requests.length,
      openRequests: requests.filter((request) => openStatuses.includes(request.status)).length,
      overdueRequests: requests.filter(
        (request) =>
          request.slaDueAt &&
          new Date(request.slaDueAt) < now &&
          ![ServiceRequestStatus.COMPLETED, ServiceRequestStatus.CANCELLED].includes(request.status),
      ).length,
      urgentRequests: requests.filter((request) => request.priority === ServiceRequestPriority.URGENT).length,
    };
  }

  private calculateSlaDueDate(priority: ServiceRequestPriority, type: ServiceRequestType) {
    const dueDate = new Date();
    const hourIncrement =
      priority === ServiceRequestPriority.URGENT
        ? 8
        : priority === ServiceRequestPriority.HIGH
          ? 24
          : type === ServiceRequestType.BULKY_PICKUP
            ? 72
            : 48;
    dueDate.setHours(dueDate.getHours() + hourIncrement);
    return dueDate;
  }

  private createRequestNumber() {
    return `SR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  }
}
