import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionStatus, WasteCollection } from '../waste-collection/entities/waste-collection.entity';
import { User } from '../users/entities/user.entity';
import { CollectionRoute, RouteFrequency, RouteStatus } from './entities/collection-route.entity';
import { NotificationsService } from '../notifications/notifications.service';

const ROUTE_STAFF_ROLES = ['admin', 'psp_operator', 'ward_officer', 'supervisor', 'dispatcher'];

@Injectable()
export class CollectionRoutesService {
  constructor(
    @InjectRepository(CollectionRoute)
    private collectionRoutesRepository: Repository<CollectionRoute>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(WasteCollection)
    private wasteCollectionRepository: Repository<WasteCollection>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<CollectionRoute[]> {
    return this.collectionRoutesRepository.find({
      order: { nextCollectionDate: 'ASC' },
      relations: ['pspOperator'],
    });
  }

  async findOne(id: string): Promise<CollectionRoute> {
    const route = await this.collectionRoutesRepository.findOne({
      where: { id },
      relations: ['pspOperator'],
    });
    if (!route) {
      throw new NotFoundException('Collection route not found');
    }
    return route;
  }

  async findForResident(userId: string): Promise<CollectionRoute[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Resident not found');
    }

    return this.collectionRoutesRepository.find({
      where: { ward: user.ward, street: user.street },
      order: { nextCollectionDate: 'ASC' },
      relations: ['pspOperator'],
    });
  }

  async create(data: Partial<CollectionRoute>): Promise<CollectionRoute> {
    const route = this.collectionRoutesRepository.create({
      ...data,
      routeCode: this.createRouteCode(data.ward, data.street),
      frequency: data.frequency || RouteFrequency.WEEKLY,
      status: data.status || RouteStatus.ACTIVE,
      nextCollectionDate: data.nextCollectionDate ? new Date(data.nextCollectionDate) : new Date(),
    });
    const saved = await this.collectionRoutesRepository.save(route);
    this.notificationsService.notify('collection-route-update', saved, {
      roles: ROUTE_STAFF_ROLES,
      residentLocation: { ward: saved.ward, street: saved.street },
    });
    return saved;
  }

  async update(id: string, data: Partial<CollectionRoute>): Promise<CollectionRoute> {
    const route = await this.findOne(id);
    Object.assign(route, {
      ...data,
      nextCollectionDate: data.nextCollectionDate ? new Date(data.nextCollectionDate) : route.nextCollectionDate,
    });
    const saved = await this.collectionRoutesRepository.save(route);
    this.notificationsService.notify('collection-route-update', saved, {
      roles: ROUTE_STAFF_ROLES,
      residentLocation: { ward: saved.ward, street: saved.street },
    });
    return saved;
  }

  async completeRoute(id: string, completedAt?: string, notes?: string): Promise<CollectionRoute> {
    const route = await this.findOne(id);
    const serviceTime = completedAt ? new Date(completedAt) : new Date();
    const residents = await this.usersRepository.find({
      where: { ward: route.ward, street: route.street, isActive: true },
    });

    if (residents.length > 0) {
      for (const resident of residents) {
        const existingCollection = await this.findRouteCollectionForResident(
          route.id,
          resident.id,
          route.nextCollectionDate,
        );

        const collection = existingCollection
          ? Object.assign(existingCollection, {
              pspOperatorId: route.pspOperatorId,
              status: existingCollection.residentConfirmed ? CollectionStatus.VERIFIED : CollectionStatus.COMPLETED,
              actualCollectionTime: serviceTime,
              address: resident.address,
              ward: resident.ward,
              street: resident.street,
              latitude: resident.latitude,
              longitude: resident.longitude,
              notes: notes || existingCollection.notes || `Completed via route ${route.routeCode}`,
              scheduledTruckCode: route.truckCode,
            })
          : this.wasteCollectionRepository.create({
              residentId: resident.id,
              pspOperatorId: route.pspOperatorId,
              routeId: route.id,
              status: CollectionStatus.COMPLETED,
              scheduledDate: route.nextCollectionDate,
              actualCollectionTime: serviceTime,
              address: resident.address,
              ward: resident.ward,
              street: resident.street,
              latitude: resident.latitude,
              longitude: resident.longitude,
              notes: notes || `Completed via route ${route.routeCode}`,
              isVerified: false,
              scheduledTruckCode: route.truckCode,
            });

        if (existingCollection?.residentConfirmed) {
          collection.isVerified = true;
          collection.verificationTime = existingCollection.verificationTime || serviceTime;
        }

        const savedCollection = await this.wasteCollectionRepository.save(collection);
        await this.notificationsService.sendNotification({
          title: 'Collection completed',
          message: `Refuse collection for ${route.street}, ${route.ward} has been completed${route.truckCode ? ` by truck ${route.truckCode}` : ''}.`,
          type: 'collection_completed',
          userId: resident.id,
          data: savedCollection,
        });
      }
    }

    route.lastCompletedAt = serviceTime;
    route.nextCollectionDate = this.getNextCollectionDate(serviceTime, route.frequency);
    route.notes = notes || route.notes;

    const saved = await this.collectionRoutesRepository.save(route);
    this.notificationsService.notify('collection-route-update', saved, {
      roles: ROUTE_STAFF_ROLES,
      residentLocation: { ward: saved.ward, street: saved.street },
    });
    return saved;
  }

  async getSummary(userId?: string) {
    const routes = userId ? await this.findForResident(userId) : await this.findAll();
    const now = new Date();

    return {
      totalRoutes: routes.length,
      activeRoutes: routes.filter((route) => route.status === RouteStatus.ACTIVE).length,
      disruptedRoutes: routes.filter((route) => route.status === RouteStatus.DISRUPTED).length,
      dueToday: routes.filter((route) => new Date(route.nextCollectionDate).toDateString() === now.toDateString())
        .length,
    };
  }

  async confirmResidentCollection(
    routeId: string,
    userId: string,
    observedTruckCode?: string,
  ): Promise<WasteCollection> {
    const route = await this.findOne(routeId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Resident not found');
    }

    if (route.ward !== user.ward || route.street !== user.street) {
      throw new BadRequestException('This route is not assigned to your street.');
    }

    if (!route.truckCode) {
      throw new BadRequestException('No truck has been scheduled for this route yet.');
    }

    const normalizedObservedTruckCode = observedTruckCode?.trim().toUpperCase();
    const normalizedScheduledTruckCode = route.truckCode.trim().toUpperCase();

    if (!normalizedObservedTruckCode) {
      throw new BadRequestException('Enter the truck code displayed on the arriving refuse truck.');
    }

    if (normalizedObservedTruckCode !== normalizedScheduledTruckCode) {
      throw new BadRequestException(
        `Truck mismatch. The scheduled truck for this area is ${route.truckCode}.`,
      );
    }

    const collectionTime = new Date();
    const existingCollection = await this.findRouteCollectionForResident(route.id, user.id, route.nextCollectionDate);
    const collection = existingCollection
      ? Object.assign(existingCollection, {
          pspOperatorId: route.pspOperatorId,
          status: CollectionStatus.VERIFIED,
          actualCollectionTime: collectionTime,
          address: user.address,
          ward: user.ward,
          street: user.street,
          latitude: user.latitude,
          longitude: user.longitude,
          routeId: route.id,
          scheduledTruckCode: route.truckCode,
          reportedTruckCode: normalizedObservedTruckCode,
          residentConfirmed: true,
          residentConfirmedAt: collectionTime,
          isVerified: true,
          verificationTime: collectionTime,
          notes:
            existingCollection.notes ||
            `Resident confirmed collection for route ${route.routeCode} with truck ${route.truckCode}.`,
        })
      : this.wasteCollectionRepository.create({
          residentId: user.id,
          pspOperatorId: route.pspOperatorId,
          routeId: route.id,
          status: CollectionStatus.VERIFIED,
          scheduledDate: route.nextCollectionDate,
          actualCollectionTime: collectionTime,
          address: user.address,
          ward: user.ward,
          street: user.street,
          latitude: user.latitude,
          longitude: user.longitude,
          notes: `Resident confirmed collection for route ${route.routeCode} with truck ${route.truckCode}.`,
          isVerified: true,
          verificationTime: collectionTime,
          scheduledTruckCode: route.truckCode,
          reportedTruckCode: normalizedObservedTruckCode,
          residentConfirmed: true,
          residentConfirmedAt: collectionTime,
        });

    const saved = await this.wasteCollectionRepository.save(collection);
    this.notificationsService.notify('waste-collection-update', saved, {
      userIds: [user.id],
      roles: ROUTE_STAFF_ROLES,
    });
    return saved;
  }

  private getNextCollectionDate(date: Date, frequency: RouteFrequency): Date {
    const nextDate = new Date(date);
    const dayIncrement =
      frequency === RouteFrequency.DAILY ? 1 : frequency === RouteFrequency.BIWEEKLY ? 14 : frequency === RouteFrequency.MONTHLY ? 30 : 7;
    nextDate.setDate(nextDate.getDate() + dayIncrement);
    return nextDate;
  }

  private createRouteCode(ward?: string, street?: string) {
    const wardCode = (ward || 'ward').replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase();
    const streetCode = (street || 'street').replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase();
    return `${wardCode}-${streetCode}-${Date.now().toString().slice(-5)}`;
  }

  private async findRouteCollectionForResident(routeId: string, residentId: string, scheduledDate: Date) {
    const routeCollections = await this.wasteCollectionRepository.find({
      where: {
        routeId,
        residentId,
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return (
      routeCollections.find((collection) => {
        const collectionDate = new Date(collection.scheduledDate);
        return collectionDate.toDateString() === scheduledDate.toDateString();
      }) || null
    );
  }
}
