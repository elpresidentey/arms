import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { CollectionRoute, RouteStatus } from '../collection-routes/entities/collection-route.entity';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { ServiceRequest, ServiceRequestStatus } from '../service-requests/entities/service-request.entity';
import { CollectionStatus, WasteCollection } from '../waste-collection/entities/waste-collection.entity';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { VehicleAssignment, AssignmentStatus } from '../drivers/entities/vehicle-assignment.entity';
import { RouteExecution, ExecutionStatus } from '../route-executions/entities/route-execution.entity';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(CollectionRoute)
    private readonly collectionRoutesRepository: Repository<CollectionRoute>,
    @InjectRepository(WasteCollection)
    private readonly wasteCollectionsRepository: Repository<WasteCollection>,
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestsRepository: Repository<ServiceRequest>,
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(VehicleAssignment)
    private readonly assignmentsRepository: Repository<VehicleAssignment>,
    @InjectRepository(RouteExecution)
    private readonly executionsRepository: Repository<RouteExecution>,
  ) {}

  async getSummary() {
    const [routes, collections, serviceRequests, reports, drivers, vehicles, assignments, executions] = await Promise.all([
      this.collectionRoutesRepository.find({ order: { nextCollectionDate: 'ASC' } }),
      this.wasteCollectionsRepository.find({ order: { scheduledDate: 'ASC' } }),
      this.serviceRequestsRepository.find({ order: { createdAt: 'DESC' } }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
      this.driversRepository.find({
        where: { status: Not(DriverStatus.INACTIVE) },
        relations: ['user'],
      }),
      this.vehiclesRepository.find({
        where: { status: Not(VehicleStatus.RETIRED) },
      }),
      this.assignmentsRepository.find({
        where: { status: AssignmentStatus.ACTIVE, unassignedDate: IsNull() },
        relations: ['driver', 'driver.user', 'vehicle'],
      }),
      this.executionsRepository.find({
        where: { 
          scheduledDate: new Date(new Date().toISOString().split('T')[0]),
        },
        relations: ['route', 'driver', 'driver.user', 'vehicle'],
      }),
    ]);

    const today = new Date();
    const isToday = (value?: Date | string | null) => {
      if (!value) return false;
      return new Date(value).toDateString() === today.toDateString();
    };

    // Fleet analysis with real vehicle data
    const operationalVehicles = vehicles.filter(v => v.status === VehicleStatus.OPERATIONAL);
    const assignedVehicles = assignments.length;
    const todaysExecutions = executions.filter(e => isToday(e.scheduledDate));
    const activeExecutions = todaysExecutions.filter(e => 
      [ExecutionStatus.SCHEDULED, ExecutionStatus.IN_PROGRESS].includes(e.status)
    );

    // Driver analysis
    const activeDrivers = drivers.filter(d => d.status === DriverStatus.ACTIVE);
    const assignedDrivers = assignments.length;
    const availableDrivers = activeDrivers.length - assignedDrivers;

    // Route analysis (keeping legacy support)
    const activeRoutes = routes.filter((route) => route.status === RouteStatus.ACTIVE);
    const dueTodayRoutes = activeRoutes.filter((route) => isToday(route.nextCollectionDate));
    const assignedDueTodayRoutes = dueTodayRoutes.filter((route) => route.truckCode);
    const unassignedRoutes = activeRoutes.filter((route) => !route.truckCode);

    // Service queues
    const pendingCollections = collections.filter((collection) =>
      [CollectionStatus.SCHEDULED, CollectionStatus.IN_PROGRESS].includes(collection.status),
    );
    const openServiceRequests = serviceRequests.filter((request) =>
      [
        ServiceRequestStatus.SUBMITTED,
        ServiceRequestStatus.TRIAGED,
        ServiceRequestStatus.SCHEDULED,
        ServiceRequestStatus.IN_PROGRESS,
        ServiceRequestStatus.ESCALATED,
      ].includes(request.status),
    );
    const openComplaints = reports.filter((report) => ![ReportStatus.RESOLVED, ReportStatus.CLOSED].includes(report.status));

    // Fleet readiness calculation
    const readinessPercent = dueTodayRoutes.length > 0 
      ? Math.round((assignedDueTodayRoutes.length / dueTodayRoutes.length) * 100) 
      : 100;

    // Vehicle deployments with real data
    const vehicleDeployments = assignments.map((assignment) => {
      const vehicle = assignment.vehicle;
      const driver = assignment.driver;
      const todaysRoutes = todaysExecutions.filter(e => e.vehicleId === vehicle.id);
      const completedToday = todaysRoutes.filter(e => e.status === ExecutionStatus.COMPLETED).length;
      const inProgress = todaysRoutes.filter(e => e.status === ExecutionStatus.IN_PROGRESS).length;

      return {
        vehicleCode: vehicle.vehicleCode,
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        status: vehicle.status,
        driverName: `${driver.user.firstName} ${driver.user.lastName}`,
        driverCode: driver.driverCode,
        routesToday: todaysRoutes.length,
        completedToday,
        inProgress: inProgress > 0,
        currentLocation: vehicle.currentLocation,
        nextRoute: todaysRoutes.find(e => e.status === ExecutionStatus.SCHEDULED) 
          ? {
              id: todaysRoutes[0].route.id,
              routeCode: todaysRoutes[0].route.routeCode,
              name: todaysRoutes[0].route.name,
              ward: todaysRoutes[0].route.ward,
              street: todaysRoutes[0].route.street,
              scheduledTime: todaysRoutes[0].scheduledDate,
            }
          : null,
      };
    });

    // Driver performance summary
    const driverSummary = activeDrivers.slice(0, 10).map(driver => {
      const assignment = assignments.find(a => a.driverId === driver.id);
      const todaysRoutes = executions.filter(e => e.driverId === driver.id);
      
      return {
        id: driver.id,
        driverCode: driver.driverCode,
        name: `${driver.user.firstName} ${driver.user.lastName}`,
        status: driver.status,
        performanceRating: driver.performanceRating,
        totalRoutes: driver.totalRoutes,
        completedRoutes: driver.completedRoutes,
        currentVehicle: assignment?.vehicle?.vehicleCode || null,
        routesToday: todaysRoutes.length,
        licenseExpiry: driver.licenseExpiryDate,
      };
    });

    return {
      fleet: {
        totalVehicles: vehicles.length,
        operationalVehicles: operationalVehicles.length,
        assignedVehicles: assignedVehicles,
        availableVehicles: operationalVehicles.length - assignedVehicles,
        maintenanceVehicles: vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
        outOfServiceVehicles: vehicles.filter(v => v.status === VehicleStatus.OUT_OF_SERVICE).length,
        // Legacy truck data for backward compatibility
        totalTrucks: vehicles.length,
        deployedToday: activeExecutions.length,
        idleToday: Math.max(operationalVehicles.length - activeExecutions.length, 0),
        unassignedRoutes: unassignedRoutes.length,
      },
      drivers: {
        totalDrivers: drivers.length,
        activeDrivers: activeDrivers.length,
        assignedDrivers: assignedDrivers,
        availableDrivers: availableDrivers,
        onLeave: drivers.filter(d => d.status === DriverStatus.ON_LEAVE).length,
        suspended: drivers.filter(d => d.status === DriverStatus.SUSPENDED).length,
      },
      readiness: {
        activeRoutes: activeRoutes.length,
        dueToday: dueTodayRoutes.length,
        readyToday: assignedDueTodayRoutes.length,
        missingTruckToday: dueTodayRoutes.length - assignedDueTodayRoutes.length,
        disruptedRoutes: routes.filter((route) => route.status === RouteStatus.DISRUPTED).length,
        readinessPercent,
        scheduledExecutions: todaysExecutions.filter(e => e.status === ExecutionStatus.SCHEDULED).length,
        inProgressExecutions: todaysExecutions.filter(e => e.status === ExecutionStatus.IN_PROGRESS).length,
        completedExecutions: todaysExecutions.filter(e => e.status === ExecutionStatus.COMPLETED).length,
      },
      queues: {
        pendingCollections: pendingCollections.length,
        openServiceRequests: openServiceRequests.length,
        openComplaints: openComplaints.length,
        urgentServiceRequests: openServiceRequests.filter((request) => request.priority === 'urgent').length,
        urgentComplaints: openComplaints.filter((report) => report.priority === 'urgent').length,
      },
      vehicleDeployments,
      driverSummary,
      attention: {
        unassignedRoutes: unassignedRoutes.slice(0, 6).map((route) => ({
          id: route.id,
          routeCode: route.routeCode,
          name: route.name,
          ward: route.ward,
          street: route.street,
          nextCollectionDate: route.nextCollectionDate,
        })),
        disruptedRoutes: routes
          .filter((route) => route.status === RouteStatus.DISRUPTED)
          .slice(0, 6)
          .map((route) => ({
            id: route.id,
            routeCode: route.routeCode,
            name: route.name,
            ward: route.ward,
            street: route.street,
            truckCode: route.truckCode,
            nextCollectionDate: route.nextCollectionDate,
          })),
        maintenanceAlerts: vehicles
          .filter(v => v.nextServiceDue && new Date(v.nextServiceDue) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
          .slice(0, 5)
          .map(v => ({
            vehicleCode: v.vehicleCode,
            plateNumber: v.plateNumber,
            nextServiceDue: v.nextServiceDue,
            currentMileage: v.currentMileage,
          })),
        expiringLicenses: drivers
          .filter(d => new Date(d.licenseExpiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
          .slice(0, 5)
          .map(d => ({
            driverCode: d.driverCode,
            name: `${d.user.firstName} ${d.user.lastName}`,
            licenseExpiryDate: d.licenseExpiryDate,
          })),
      },
    };
  }

  async getFleetDetails() {
    const [vehicles, drivers, assignments] = await Promise.all([
      this.vehiclesRepository.find({
        relations: ['maintenanceRecords'],
        order: { createdAt: 'DESC' },
      }),
      this.driversRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      }),
      this.assignmentsRepository.find({
        where: { status: AssignmentStatus.ACTIVE, unassignedDate: IsNull() },
        relations: ['driver', 'driver.user', 'vehicle'],
      }),
    ]);

    return {
      vehicles: vehicles.map(vehicle => {
        const assignment = assignments.find(a => a.vehicleId === vehicle.id);
        const overdueMaintenance = vehicle.maintenanceRecords.filter(m => 
          m.status === 'overdue' || 
          (m.scheduledDate && new Date(m.scheduledDate) < new Date() && m.status === 'scheduled')
        );

        return {
          ...vehicle,
          currentDriver: assignment ? {
            id: assignment.driver.id,
            driverCode: assignment.driver.driverCode,
            name: `${assignment.driver.user.firstName} ${assignment.driver.user.lastName}`,
            assignedDate: assignment.assignedDate,
          } : null,
          maintenanceStatus: {
            overdue: overdueMaintenance.length,
            nextService: vehicle.nextServiceDue,
            lastService: vehicle.lastServiceDate,
          },
        };
      }),
      drivers: drivers.map(driver => {
        const assignment = assignments.find(a => a.driverId === driver.id);
        
        return {
          ...driver,
          currentVehicle: assignment ? {
            id: assignment.vehicle.id,
            vehicleCode: assignment.vehicle.vehicleCode,
            plateNumber: assignment.vehicle.plateNumber,
            vehicleType: assignment.vehicle.vehicleType,
            assignedDate: assignment.assignedDate,
          } : null,
        };
      }),
      assignments: assignments.map(assignment => ({
        id: assignment.id,
        driver: {
          id: assignment.driver.id,
          driverCode: assignment.driver.driverCode,
          name: `${assignment.driver.user.firstName} ${assignment.driver.user.lastName}`,
          performanceRating: assignment.driver.performanceRating,
        },
        vehicle: {
          id: assignment.vehicle.id,
          vehicleCode: assignment.vehicle.vehicleCode,
          plateNumber: assignment.vehicle.plateNumber,
          vehicleType: assignment.vehicle.vehicleType,
          status: assignment.vehicle.status,
        },
        assignedDate: assignment.assignedDate,
        status: assignment.status,
      })),
    };
  }
}
