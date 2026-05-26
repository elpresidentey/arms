import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceSchedule } from './entities/service-schedule.entity';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { UpdateServiceScheduleDto } from './dto/update-service-schedule.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ServiceSchedulesService {
  constructor(
    @InjectRepository(ServiceSchedule)
    private readonly scheduleRepository: Repository<ServiceSchedule>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new service schedule (draft status)
   */
  async create(
    createScheduleDto: CreateServiceScheduleDto,
    userId: string,
  ): Promise<ServiceSchedule> {
    const scheduleCode = this.generateScheduleCode(
      createScheduleDto.serviceType,
      createScheduleDto.ward,
    );

    const schedule = this.scheduleRepository.create({
      ...createScheduleDto,
      scheduleCode,
      status: 'draft',
      publishedById: userId,
      effectiveFromDate: createScheduleDto.effectiveFromDate
        ? new Date(createScheduleDto.effectiveFromDate)
        : null,
      effectiveToDate: createScheduleDto.effectiveToDate
        ? new Date(createScheduleDto.effectiveToDate)
        : null,
    });

    return this.scheduleRepository.save(schedule);
  }

  /**
   * Get all schedules with optional filtering
   */
  async findAll(
    status?: 'draft' | 'published' | 'archived' | 'suspended',
    ward?: string,
    serviceType?: string,
  ): Promise<ServiceSchedule[]> {
    const query = this.scheduleRepository.createQueryBuilder('schedule');

    if (status) {
      query.andWhere('schedule.status = :status', { status });
    }

    if (ward) {
      query.andWhere('schedule.ward = :ward', { ward });
    }

    if (serviceType) {
      query.andWhere('schedule.serviceType = :serviceType', { serviceType });
    }

    return query
      .orderBy('schedule.publishedDate', 'DESC')
      .addOrderBy('schedule.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get published schedules for residents (public view)
   */
  async findPublished(ward?: string, serviceType?: string): Promise<ServiceSchedule[]> {
    const query = this.scheduleRepository.createQueryBuilder('schedule')
      .where('schedule.status = :status', { status: 'published' })
      .andWhere('schedule.publishedDate IS NOT NULL');

    if (ward) {
      query.andWhere('schedule.ward = :ward', { ward });
    }

    if (serviceType) {
      query.andWhere('schedule.serviceType = :serviceType', { serviceType });
    }

    // Filter by effective dates if set
    const now = new Date();
    query.andWhere(
      '(schedule.effectiveFromDate IS NULL OR schedule.effectiveFromDate <= :now)',
      { now },
    );
    query.andWhere(
      '(schedule.effectiveToDate IS NULL OR schedule.effectiveToDate >= :now)',
      { now },
    );

    return query
      .orderBy('schedule.ward', 'ASC')
      .addOrderBy('schedule.street', 'ASC')
      .addOrderBy('schedule.serviceType', 'ASC')
      .getMany();
  }

  /**
   * Get a single schedule by ID
   */
  async findOne(id: string): Promise<ServiceSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['publishedBy'],
    });

    if (!schedule) {
      throw new NotFoundException(`Service schedule with ID ${id} not found`);
    }

    return schedule;
  }

  /**
   * Update a service schedule
   */
  async update(
    id: string,
    updateScheduleDto: UpdateServiceScheduleDto,
  ): Promise<ServiceSchedule> {
    const schedule = await this.findOne(id);

    // Cannot update published schedules directly
    if (schedule.status === 'published' && updateScheduleDto.status !== 'archived') {
      throw new BadRequestException(
        'Cannot update published schedules. Archive and create a new one instead.',
      );
    }

    const updateData = {
      ...updateScheduleDto,
      effectiveFromDate: updateScheduleDto.effectiveFromDate
        ? new Date(updateScheduleDto.effectiveFromDate)
        : schedule.effectiveFromDate,
      effectiveToDate: updateScheduleDto.effectiveToDate
        ? new Date(updateScheduleDto.effectiveToDate)
        : schedule.effectiveToDate,
    };

    Object.assign(schedule, updateData);
    return this.scheduleRepository.save(schedule);
  }

  /**
   * Publish a schedule (make it visible to residents)
   */
  async publish(id: string, userId: string): Promise<ServiceSchedule> {
    const schedule = await this.findOne(id);

    if (schedule.status === 'published') {
      throw new BadRequestException('Schedule is already published');
    }

    schedule.status = 'published';
    schedule.publishedDate = new Date();
    schedule.publishedById = userId;

    const saved = await this.scheduleRepository.save(schedule);

    // Notify residents in the ward
    await this.notificationsService.notifyWardResidents(
      schedule.ward,
      `New ${schedule.serviceType} schedule published for ${schedule.ward}`,
      {
        type: 'SCHEDULE_PUBLISHED',
        scheduleId: schedule.id,
        serviceType: schedule.serviceType,
      },
    );

    return saved;
  }

  /**
   * Archive a schedule
   */
  async archive(id: string): Promise<ServiceSchedule> {
    const schedule = await this.findOne(id);

    schedule.status = 'archived';
    return this.scheduleRepository.save(schedule);
  }

  /**
   * Suspend a schedule (temporarily unavailable)
   */
  async suspend(id: string, reason?: string): Promise<ServiceSchedule> {
    const schedule = await this.findOne(id);

    schedule.status = 'suspended';
    if (reason) {
      schedule.notes = `${schedule.notes || ''}\nSuspended: ${reason}`.trim();
    }

    const saved = await this.scheduleRepository.save(schedule);

    // Notify residents about suspension
    await this.notificationsService.notifyWardResidents(
      schedule.ward,
      `${schedule.serviceType} schedule suspended for ${schedule.ward}`,
      {
        type: 'SCHEDULE_SUSPENDED',
        scheduleId: schedule.id,
        reason,
      },
    );

    return saved;
  }

  /**
   * Delete a schedule (only draft schedules)
   */
  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);

    if (schedule.status !== 'draft') {
      throw new BadRequestException('Only draft schedules can be deleted');
    }

    await this.scheduleRepository.remove(schedule);
  }

  /**
   * Get schedules by ward
   */
  async findByWard(ward: string, publishedOnly = false): Promise<ServiceSchedule[]> {
    const query = this.scheduleRepository.createQueryBuilder('schedule')
      .where('schedule.ward = :ward', { ward });

    if (publishedOnly) {
      query.andWhere('schedule.status = :status', { status: 'published' });
    }

    return query.orderBy('schedule.serviceType', 'ASC').getMany();
  }

  /**
   * Get schedules by service type
   */
  async findByServiceType(
    serviceType: string,
    publishedOnly = false,
  ): Promise<ServiceSchedule[]> {
    const query = this.scheduleRepository.createQueryBuilder('schedule')
      .where('schedule.serviceType = :serviceType', { serviceType });

    if (publishedOnly) {
      query.andWhere('schedule.status = :status', { status: 'published' });
    }

    return query.orderBy('schedule.ward', 'ASC').getMany();
  }

  /**
   * Get schedule statistics
   */
  async getStatistics(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    suspended: number;
    byServiceType: Record<string, number>;
    byWard: Record<string, number>;
  }> {
    const schedules = await this.scheduleRepository.find();

    const stats = {
      total: schedules.length,
      published: 0,
      draft: 0,
      archived: 0,
      suspended: 0,
      byServiceType: {} as Record<string, number>,
      byWard: {} as Record<string, number>,
    };

    schedules.forEach((schedule) => {
      stats[schedule.status]++;

      stats.byServiceType[schedule.serviceType] =
        (stats.byServiceType[schedule.serviceType] || 0) + 1;
      stats.byWard[schedule.ward] = (stats.byWard[schedule.ward] || 0) + 1;
    });

    return stats;
  }

  /**
   * Generate unique schedule code
   */
  private generateScheduleCode(serviceType: string, ward: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const typeCode = serviceType.substring(0, 3).toUpperCase();
    const wardCode = ward.substring(0, 3).toUpperCase();
    return `SCH-${typeCode}-${wardCode}-${timestamp}`;
  }
}
