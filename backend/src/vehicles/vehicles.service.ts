import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { MaintenanceRecord, MaintenanceStatus } from './entities/maintenance-record.entity';
import { VehicleAssignment, AssignmentStatus } from '../drivers/entities/vehicle-assignment.entity';
import { CreateVehicleDto, UpdateVehicleDto, ScheduleMaintenanceDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(MaintenanceRecord)
    private readonly maintenanceRepository: Repository<MaintenanceRecord>,
    @InjectRepository(VehicleAssignment)
    private readonly assignmentsRepository: Repository<VehicleAssignment>,
  ) {}

  async findAll(includeRetired = false) {
    const where = includeRetired ? {} : { status: Not(VehicleStatus.RETIRED) };
    
    return this.vehiclesRepository.find({
      where,
      relations: ['driverAssignments', 'driverAssignments.driver', 'driverAssignments.driver.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations: [
        'driverAssignments', 
        'driverAssignments.driver', 
        'driverAssignments.driver.user',
        'maintenanceRecords',
        'routeExecutions',
      ],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async findByVehicleCode(vehicleCode: string) {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { vehicleCode },
      relations: ['driverAssignments', 'driverAssignments.driver', 'driverAssignments.driver.user'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async getCurrentDriver(vehicleId: string) {
    const assignment = await this.assignmentsRepository.findOne({
      where: {
        vehicleId,
        status: AssignmentStatus.ACTIVE,
        unassignedDate: IsNull(),
      },
      relations: ['driver', 'driver.user'],
    });

    return assignment?.driver || null;
  }

  async getFleetSummary() {
    const vehicles = await this.vehiclesRepository.find({
      relations: ['driverAssignments', 'maintenanceRecords'],
    });

    const summary = {
      total: vehicles.length,
      operational: vehicles.filter(v => v.status === VehicleStatus.OPERATIONAL).length,
      maintenance: vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
      outOfService: vehicles.filter(v => v.status === VehicleStatus.OUT_OF_SERVICE).length,
      retired: vehicles.filter(v => v.status === VehicleStatus.RETIRED).length,
      assigned: 0,
      unassigned: 0,
      maintenanceOverdue: 0,
      registrationExpiring: 0, // Within 30 days
      insuranceExpiring: 0, // Within 30 days
    };

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    for (const vehicle of vehicles) {
      // Count assigned vehicles
      const hasActiveAssignment = vehicle.driverAssignments.some(
        a => a.status === AssignmentStatus.ACTIVE && !a.unassignedDate
      );
      
      if (hasActiveAssignment) {
        summary.assigned++;
      } else {
        summary.unassigned++;
      }

      // Check maintenance overdue
      if (vehicle.nextServiceDue && new Date(vehicle.nextServiceDue) < new Date()) {
        summary.maintenanceOverdue++;
      }

      // Check expiring documents
      if (vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) <= thirtyDaysFromNow) {
        summary.registrationExpiring++;
      }

      if (vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) <= thirtyDaysFromNow) {
        summary.insuranceExpiring++;
      }
    }

    return summary;
  }

  async create(createVehicleDto: CreateVehicleDto) {
    // Generate vehicle code
    const lastVehicle = await this.vehiclesRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    const nextNumber = lastVehicle 
      ? parseInt(lastVehicle.vehicleCode.replace(/[A-Z]+/, '')) + 1 
      : 1;
    
    const vehicleCode = `TR${nextNumber.toString().padStart(3, '0')}`;

    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      vehicleCode,
    });

    return this.vehiclesRepository.save(vehicle);
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.findById(id);

    Object.assign(vehicle, updateVehicleDto);

    // If status changed to maintenance or out of service, update location
    if (updateVehicleDto.status && 
        [VehicleStatus.MAINTENANCE, VehicleStatus.OUT_OF_SERVICE].includes(updateVehicleDto.status)) {
      vehicle.currentLocation = vehicle.currentLocation || 'Depot - Service Bay';
    }

    return this.vehiclesRepository.save(vehicle);
  }

  async updateLocation(id: string, location: string, latitude?: number, longitude?: number) {
    const vehicle = await this.findById(id);

    vehicle.currentLocation = location;
    if (latitude !== undefined) vehicle.latitude = latitude;
    if (longitude !== undefined) vehicle.longitude = longitude;

    return this.vehiclesRepository.save(vehicle);
  }

  async scheduleMaintenance(id: string, maintenanceDto: ScheduleMaintenanceDto) {
    const vehicle = await this.findById(id);

    const maintenance = this.maintenanceRepository.create({
      vehicleId: id,
      ...maintenanceDto,
    });

    await this.maintenanceRepository.save(maintenance);

    // Update vehicle status if it's scheduled maintenance
    if (maintenanceDto.status === MaintenanceStatus.SCHEDULED && 
        new Date(maintenanceDto.scheduledDate) <= new Date()) {
      vehicle.status = VehicleStatus.MAINTENANCE;
      await this.vehiclesRepository.save(vehicle);
    }

    return maintenance;
  }

  async getMaintenanceHistory(id: string) {
    return this.maintenanceRepository.find({
      where: { vehicleId: id },
      relations: ['createdBy'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async getPerformanceStats(id: string) {
    const vehicle = await this.findById(id);
    
    // Get route execution stats
    const routeStats = await this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .leftJoin('vehicle.routeExecutions', 'execution')
      .select([
        'COUNT(execution.id) as total_routes',
        'COUNT(CASE WHEN execution.status = "completed" THEN 1 END) as completed_routes',
        'AVG(execution.totalDistance) as avg_distance',
        'AVG(execution.fuelUsed) as avg_fuel',
        'AVG(execution.wasteCollected) as avg_waste',
        'SUM(CASE WHEN execution.status = "completed" THEN execution.totalDistance ELSE 0 END) as total_distance',
        'SUM(CASE WHEN execution.status = "completed" THEN execution.fuelUsed ELSE 0 END) as total_fuel',
      ])
      .where('vehicle.id = :id', { id })
      .getRawOne();

    // Get maintenance stats
    const maintenanceStats = await this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .select([
        'COUNT(*) as total_maintenance',
        'COUNT(CASE WHEN status = "completed" THEN 1 END) as completed_maintenance',
        'AVG(actualCost) as avg_cost',
        'SUM(actualCost) as total_cost',
      ])
      .where('vehicleId = :id', { id })
      .getRawOne();

    const totalDistance = parseFloat(routeStats.total_distance) || 0;
    const totalFuel = parseFloat(routeStats.total_fuel) || 0;

    return {
      vehicle,
      performance: {
        totalRoutes: parseInt(routeStats.total_routes) || 0,
        completedRoutes: parseInt(routeStats.completed_routes) || 0,
        completionRate: routeStats.total_routes > 0 
          ? ((routeStats.completed_routes / routeStats.total_routes) * 100).toFixed(1)
          : '0.0',
        averageDistance: parseFloat(routeStats.avg_distance) || 0,
        averageFuel: parseFloat(routeStats.avg_fuel) || 0,
        averageWaste: parseFloat(routeStats.avg_waste) || 0,
        totalDistance,
        totalFuel,
        fuelEfficiency: totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0.00',
      },
      maintenance: {
        totalMaintenance: parseInt(maintenanceStats.total_maintenance) || 0,
        completedMaintenance: parseInt(maintenanceStats.completed_maintenance) || 0,
        averageCost: parseFloat(maintenanceStats.avg_cost) || 0,
        totalCost: parseFloat(maintenanceStats.total_cost) || 0,
      },
    };
  }

  async delete(id: string) {
    const vehicle = await this.findById(id);

    // Soft delete - mark as retired instead of removing
    vehicle.status = VehicleStatus.RETIRED;
    
    // End any active assignments
    await this.assignmentsRepository.update(
      {
        vehicleId: id,
        status: AssignmentStatus.ACTIVE,
        unassignedDate: IsNull(),
      },
      {
        status: AssignmentStatus.INACTIVE,
        unassignedDate: new Date(),
        reason: 'Vehicle retired',
      }
    );

    return this.vehiclesRepository.save(vehicle);
  }
}