import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';
import { VehicleAssignment, AssignmentStatus } from './entities/vehicle-assignment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { CreateDriverDto, UpdateDriverDto, AssignVehicleDto } from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
    @InjectRepository(VehicleAssignment)
    private readonly assignmentsRepository: Repository<VehicleAssignment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { status: Not(DriverStatus.INACTIVE) };
    
    return this.driversRepository.find({
      where,
      relations: ['user', 'vehicleAssignments', 'vehicleAssignments.vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const driver = await this.driversRepository.findOne({
      where: { id },
      relations: ['user', 'vehicleAssignments', 'vehicleAssignments.vehicle', 'routeExecutions'],
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async findByDriverCode(driverCode: string) {
    const driver = await this.driversRepository.findOne({
      where: { driverCode },
      relations: ['user', 'vehicleAssignments', 'vehicleAssignments.vehicle'],
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async getCurrentVehicle(driverId: string) {
    const assignment = await this.assignmentsRepository.findOne({
      where: {
        driverId,
        status: AssignmentStatus.ACTIVE,
        unassignedDate: IsNull(),
      },
      relations: ['vehicle'],
    });

    return assignment?.vehicle || null;
  }

  async create(createDriverDto: CreateDriverDto) {
    // Verify the user exists and is eligible to be a driver
    const user = await this.usersRepository.findOne({
      where: { id: createDriverDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a driver
    const existingDriver = await this.driversRepository.findOne({
      where: { userId: createDriverDto.userId },
    });

    if (existingDriver) {
      throw new BadRequestException('User is already registered as a driver');
    }

    // Generate driver code
    const lastDriver = await this.driversRepository.findOne({
      order: { createdAt: 'DESC' },
    });

    const nextNumber = lastDriver 
      ? parseInt(lastDriver.driverCode.replace('DR', '')) + 1 
      : 1;
    
    const driverCode = `DR${nextNumber.toString().padStart(3, '0')}`;

    const driver = this.driversRepository.create({
      ...createDriverDto,
      driverCode,
      specializations: Array.isArray(createDriverDto.specializations) 
        ? JSON.stringify(createDriverDto.specializations)
        : createDriverDto.specializations,
    });

    return this.driversRepository.save(driver);
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    const driver = await this.findById(id);

    Object.assign(driver, updateDriverDto);

    return this.driversRepository.save(driver);
  }

  async assignVehicle(id: string, assignVehicleDto: AssignVehicleDto) {
    const driver = await this.findById(id);
    
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: assignVehicleDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== VehicleStatus.OPERATIONAL) {
      throw new BadRequestException('Vehicle is not operational');
    }

    // End any current assignments for this driver
    await this.assignmentsRepository.update(
      {
        driverId: id,
        status: AssignmentStatus.ACTIVE,
        unassignedDate: IsNull(),
      },
      {
        status: AssignmentStatus.INACTIVE,
        unassignedDate: new Date(),
      }
    );

    // End any current assignments for this vehicle
    await this.assignmentsRepository.update(
      {
        vehicleId: assignVehicleDto.vehicleId,
        status: AssignmentStatus.ACTIVE,
        unassignedDate: IsNull(),
      },
      {
        status: AssignmentStatus.INACTIVE,
        unassignedDate: new Date(),
      }
    );

    // Create new assignment
    const assignment = this.assignmentsRepository.create({
      driverId: id,
      vehicleId: assignVehicleDto.vehicleId,
      assignedDate: new Date(),
      status: AssignmentStatus.ACTIVE,
      reason: assignVehicleDto.reason,
      notes: assignVehicleDto.notes,
    });

    await this.assignmentsRepository.save(assignment);

    return this.findById(id);
  }

  async unassignVehicle(id: string, reason?: string) {
    // End current vehicle assignment
    const updated = await this.assignmentsRepository.update(
      {
        driverId: id,
        status: AssignmentStatus.ACTIVE,
        unassignedDate: IsNull(),
      },
      {
        status: AssignmentStatus.INACTIVE,
        unassignedDate: new Date(),
        reason: reason || 'Manual unassignment',
      }
    );

    if (updated.affected === 0) {
      throw new BadRequestException('No active vehicle assignment found');
    }

    return this.findById(id);
  }

  async getPerformanceStats(id: string) {
    const driver = await this.findById(id);
    
    // Get route execution stats
    const routeStats = await this.driversRepository
      .createQueryBuilder('driver')
      .leftJoin('driver.routeExecutions', 'execution')
      .select([
        'COUNT(execution.id) as total_routes',
        'COUNT(CASE WHEN execution.status = "completed" THEN 1 END) as completed_routes',
        'AVG(CASE WHEN execution.completedAt IS NOT NULL AND execution.startedAt IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, execution.startedAt, execution.completedAt) END) as avg_duration_minutes',
        'AVG(execution.driverRating) as avg_rating',
        'AVG(execution.residentSatisfaction) as avg_satisfaction',
      ])
      .where('driver.id = :id', { id })
      .getRawOne();

    return {
      driver,
      performance: {
        totalRoutes: parseInt(routeStats.total_routes) || 0,
        completedRoutes: parseInt(routeStats.completed_routes) || 0,
        completionRate: routeStats.total_routes > 0 
          ? ((routeStats.completed_routes / routeStats.total_routes) * 100).toFixed(1)
          : '0.0',
        averageDuration: parseFloat(routeStats.avg_duration_minutes) || 0,
        averageRating: parseFloat(routeStats.avg_rating) || 0,
        averageSatisfaction: parseFloat(routeStats.avg_satisfaction) || 0,
      },
    };
  }

  async delete(id: string) {
    const driver = await this.findById(id);

    // Soft delete - mark as inactive instead of removing
    driver.status = DriverStatus.INACTIVE;
    
    // End any active vehicle assignments
    await this.assignmentsRepository.update(
      {
        driverId: id,
        status: AssignmentStatus.ACTIVE,
        unassignedDate: IsNull(),
      },
      {
        status: AssignmentStatus.INACTIVE,
        unassignedDate: new Date(),
        reason: 'Driver deactivated',
      }
    );

    return this.driversRepository.save(driver);
  }
}