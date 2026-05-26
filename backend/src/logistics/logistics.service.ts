import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionRoute, RouteStatus } from '../collection-routes/entities/collection-route.entity';
import { Report, ReportStatus } from '../reports/entities/report.entity';
import { ServiceRequest, ServiceRequestStatus } from '../service-requests/entities/service-request.entity';
import { CollectionStatus, WasteCollection } from '../waste-collection/entities/waste-collection.entity';

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
  ) {}

  async getSummary() {
    const [routes, collections, serviceRequests, reports] = await Promise.all([
      this.collectionRoutesRepository.find({ order: { nextCollectionDate: 'ASC' } }),
      this.wasteCollectionsRepository.find({ order: { scheduledDate: 'ASC' } }),
      this.serviceRequestsRepository.find({ order: { createdAt: 'DESC' } }),
      this.reportsRepository.find({ order: { createdAt: 'DESC' } }),
    ]);

    const today = new Date();
    const isToday = (value?: Date | string | null) => {
      if (!value) return false;
      return new Date(value).toDateString() === today.toDateString();
    };

    const normalizedTruckCode = (truckCode?: string | null) => truckCode?.trim().toUpperCase() || null;
    const activeRoutes = routes.filter((route) => route.status === RouteStatus.ACTIVE);
    const dueTodayRoutes = activeRoutes.filter((route) => isToday(route.nextCollectionDate));
    const assignedDueTodayRoutes = dueTodayRoutes.filter((route) => normalizedTruckCode(route.truckCode));
    const unassignedRoutes = activeRoutes.filter((route) => !normalizedTruckCode(route.truckCode));
    const truckCodes = Array.from(
      new Set(routes.map((route) => normalizedTruckCode(route.truckCode)).filter((truckCode): truckCode is string => Boolean(truckCode))),
    );
    const deployedTruckCodes = Array.from(
      new Set(assignedDueTodayRoutes.map((route) => normalizedTruckCode(route.truckCode)).filter((truckCode): truckCode is string => Boolean(truckCode))),
    );

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
    const readinessPercent = dueTodayRoutes.length > 0 ? Math.round((assignedDueTodayRoutes.length / dueTodayRoutes.length) * 100) : 100;

    const truckDeployments = truckCodes.map((truckCode) => {
      const assignedRoutes = routes.filter((route) => normalizedTruckCode(route.truckCode) === truckCode);
      const dueToday = assignedRoutes.filter((route) => isToday(route.nextCollectionDate));

      return {
        truckCode,
        routeCount: assignedRoutes.length,
        dueToday: dueToday.length,
        activeRoutes: assignedRoutes.filter((route) => route.status === RouteStatus.ACTIVE).length,
        disruptedRoutes: assignedRoutes.filter((route) => route.status === RouteStatus.DISRUPTED).length,
        nextRoute: assignedRoutes[0]
          ? {
              id: assignedRoutes[0].id,
              routeCode: assignedRoutes[0].routeCode,
              name: assignedRoutes[0].name,
              ward: assignedRoutes[0].ward,
              street: assignedRoutes[0].street,
              nextCollectionDate: assignedRoutes[0].nextCollectionDate,
              status: assignedRoutes[0].status,
            }
          : null,
      };
    });

    return {
      fleet: {
        totalTrucks: truckCodes.length,
        deployedToday: deployedTruckCodes.length,
        idleToday: Math.max(truckCodes.length - deployedTruckCodes.length, 0),
        unassignedRoutes: unassignedRoutes.length,
      },
      readiness: {
        activeRoutes: activeRoutes.length,
        dueToday: dueTodayRoutes.length,
        readyToday: assignedDueTodayRoutes.length,
        missingTruckToday: dueTodayRoutes.length - assignedDueTodayRoutes.length,
        disruptedRoutes: routes.filter((route) => route.status === RouteStatus.DISRUPTED).length,
        readinessPercent,
      },
      queues: {
        pendingCollections: pendingCollections.length,
        openServiceRequests: openServiceRequests.length,
        openComplaints: openComplaints.length,
        urgentServiceRequests: openServiceRequests.filter((request) => request.priority === 'urgent').length,
        urgentComplaints: openComplaints.filter((report) => report.priority === 'urgent').length,
      },
      truckDeployments,
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
      },
    };
  }
}
