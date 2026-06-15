import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { RouteExecution, ExecutionStatus } from './entities/route-execution.entity';
import { CollectionRoute } from '../collection-routes/entities/collection-route.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateRouteExecutionDto, UpdateRouteExecutionDto, StartRouteDto, CompleteRouteDto } from './dto/route-execution.dto';

@Injectable()
export class RouteExecutionsService {
  constructor(
    @InjectRepository(RouteExecution)
    private readonly executionsRepository: Repository<RouteExecution>,
    @InjectRepository(CollectionRoute)
    private readonly routesRepository: Repository<CollectionRoute>,
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  async findAll(filters?: {
    driverId?: string;
    vehicleId?: string;
    routeId?: string;
    status?: ExecutionStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const queryBuilder = this.executionsRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.route', 'route')
      .leftJoinAndSelect('execution.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'driverUser')
      .leftJoinAndSelect('execution.vehicle', 'vehicle')
      .orderBy('execution.scheduledDate', 'DESC');

    if (filters?.driverId) {
      queryBuilder.andWhere('execution.driverId = :driverId', { driverId: filters.driverId });
    }

    if (filters?.vehicleId) {
      queryBuilder.andWhere('execution.vehicleId = :vehicleId', { vehicleId: filters.vehicleId });
    }

    if (filters?.routeId) {
      queryBuilder.andWhere('execution.routeId = :routeId', { routeId: filters.routeId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('execution.status = :status', { status: filters.status });
    }

    if (filters?.dateFrom && filters?.dateTo) {
      queryBuilder.andWhere('execution.scheduledDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
    }

    return queryBuilder.getMany();
  }

  async findById(id: string) {
    const execution = await this.executionsRepository.findOne({
      where: { id },
      relations: ['route', 'driver', 'driver.user', 'vehicle'],
    });

    if (!execution) {
      throw new NotFoundException('Route execution not found');
    }

    return execution;
  }

  async getTodaysExecutions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findAll({
      dateFrom: today,
      dateTo: tomorrow,
    });
  }

  async create(createDto: CreateRouteExecutionDto) {
    // Validate route exists
    const route = await this.routesRepository.findOne({
      where: { id: createDto.routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // Validate driver if provided
    if (createDto.driverId) {
      const driver = await this.driversRepository.findOne({
        where: { id: createDto.driverId },
      });

      if (!driver) {
        throw new NotFoundException('Driver not found');
      }
    }

    // Validate vehicle if provided
    if (createDto.vehicleId) {
      const vehicle = await this.vehiclesRepository.findOne({
        where: { id: createDto.vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
    }

    const execution = this.executionsRepository.create(createDto);
    return this.executionsRepository.save(execution);
  }

  async startRoute(id: string, startData: StartRouteDto) {
    const execution = await this.findById(id);

    if (execution.status !== ExecutionStatus.SCHEDULED) {
      throw new BadRequestException('Route must be in scheduled status to start');
    }

    execution.status = ExecutionStatus.IN_PROGRESS;
    execution.startedAt = new Date();
    execution.startMileage = startData.startMileage;
    execution.startLocation = startData.startLocation;
    execution.startLatitude = startData.startLatitude;
    execution.startLongitude = startData.startLongitude;
    execution.notes = startData.notes || execution.notes;

    return this.executionsRepository.save(execution);
  }

  async completeRoute(id: string, completionData: CompleteRouteDto) {
    const execution = await this.findById(id);

    if (execution.status !== ExecutionStatus.IN_PROGRESS) {
      throw new BadRequestException('Route must be in progress to complete');
    }

    execution.status = ExecutionStatus.COMPLETED;
    execution.completedAt = new Date();
    execution.completedStops = completionData.completedStops;
    execution.totalDistance = completionData.totalDistance;
    execution.fuelUsed = completionData.fuelUsed;
    execution.wasteCollected = completionData.wasteCollected;
    execution.wasteUnit = completionData.wasteUnit;
    execution.endMileage = completionData.endMileage;
    execution.endLocation = completionData.endLocation;
    execution.endLatitude = completionData.endLatitude;
    execution.endLongitude = completionData.endLongitude;
    execution.routeGpsTrace = completionData.routeGpsTrace;
    execution.driverRating = completionData.driverRating;
    execution.residentSatisfaction = completionData.residentSatisfaction;
    
    if (completionData.notes) {
      execution.notes = execution.notes 
        ? `${execution.notes}\n\nCompletion: ${completionData.notes}`
        : completionData.notes;
    }

    const savedExecution = await this.executionsRepository.save(execution);

    // Update driver and vehicle stats
    await this.updateDriverStats(execution.driverId);
    await this.updateVehicleStats(execution.vehicleId);

    return savedExecution;
  }

  async reportIssue(id: string, issue: string, delayMinutes?: number) {
    const execution = await this.findById(id);

    if (execution.status === ExecutionStatus.COMPLETED || execution.status === ExecutionStatus.CANCELLED) {
      throw new BadRequestException('Cannot report issues on completed or cancelled routes');
    }

    execution.status = ExecutionStatus.DISRUPTED;
    execution.delayMinutes = (execution.delayMinutes || 0) + (delayMinutes || 0);
    
    const currentIssues = execution.issues ? JSON.parse(execution.issues) : [];
    currentIssues.push({
      timestamp: new Date().toISOString(),
      issue,
      delayMinutes: delayMinutes || 0,
    });
    execution.issues = JSON.stringify(currentIssues);

    return this.executionsRepository.save(execution);
  }

  async update(id: string, updateDto: UpdateRouteExecutionDto) {
    const execution = await this.findById(id);

    Object.assign(execution, updateDto);

    return this.executionsRepository.save(execution);
  }

  async getPerformanceMetrics(filters?: {
    driverId?: string;
    vehicleId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const executions = await this.findAll(filters);

    const completed = executions.filter(e => e.status === ExecutionStatus.COMPLETED);
    const total = executions.length;

    if (total === 0) {
      return {
        totalExecutions: 0,
        completedExecutions: 0,
        completionRate: '0.0',
        averageDuration: 0,
        averageDistance: 0,
        averageFuel: 0,
        averageWaste: 0,
        averageRating: 0,
        onTimeRate: '0.0',
      };
    }

    const durations = completed
      .filter(e => e.startedAt && e.completedAt)
      .map(e => (new Date(e.completedAt!).getTime() - new Date(e.startedAt!).getTime()) / (1000 * 60)); // minutes

    const distances = completed.filter(e => e.totalDistance).map(e => e.totalDistance!);
    const fuel = completed.filter(e => e.fuelUsed).map(e => e.fuelUsed!);
    const waste = completed.filter(e => e.wasteCollected).map(e => e.wasteCollected!);
    const ratings = completed.filter(e => e.driverRating).map(e => e.driverRating!);
    const onTime = completed.filter(e => (e.delayMinutes || 0) <= 15).length; // 15 min tolerance

    return {
      totalExecutions: total,
      completedExecutions: completed.length,
      completionRate: ((completed.length / total) * 100).toFixed(1),
      averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      averageDistance: distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0,
      averageFuel: fuel.length > 0 ? fuel.reduce((a, b) => a + b, 0) / fuel.length : 0,
      averageWaste: waste.length > 0 ? waste.reduce((a, b) => a + b, 0) / waste.length : 0,
      averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
      onTimeRate: completed.length > 0 ? ((onTime / completed.length) * 100).toFixed(1) : '0.0',
    };
  }

  private async updateDriverStats(driverId?: string) {
    if (!driverId) return;

    const driver = await this.driversRepository.findOne({ where: { id: driverId } });
    if (!driver) return;

    const executions = await this.executionsRepository.find({
      where: { driverId },
    });

    const completed = executions.filter(e => e.status === ExecutionStatus.COMPLETED);
    const durations = completed
      .filter(e => e.startedAt && e.completedAt)
      .map(e => (new Date(e.completedAt!).getTime() - new Date(e.startedAt!).getTime()) / (1000 * 60 * 60)); // hours

    driver.totalRoutes = executions.length;
    driver.completedRoutes = completed.length;
    driver.averageCompletionTime = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    await this.driversRepository.save(driver);
  }

  private async updateVehicleStats(vehicleId?: string) {
    if (!vehicleId) return;

    const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle) return;

    const executions = await this.executionsRepository.find({
      where: { vehicleId },
    });

    vehicle.totalRoutes = executions.length;

    await this.vehiclesRepository.save(vehicle);
  }

  async delete(id: string) {
    const execution = await this.findById(id);

    if (execution.status === ExecutionStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete route execution in progress');
    }

    return this.executionsRepository.remove(execution);
  }
}