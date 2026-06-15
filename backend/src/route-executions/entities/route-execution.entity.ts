import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CollectionRoute } from '../../collection-routes/entities/collection-route.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum ExecutionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISRUPTED = 'disrupted',
  CANCELLED = 'cancelled',
}

@Entity('route_executions')
export class RouteExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CollectionRoute)
  @JoinColumn({ name: 'route_id' })
  route: CollectionRoute;

  @Column()
  routeId: string;

  @ManyToOne(() => Driver, driver => driver.routeExecutions, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ nullable: true })
  driverId: string;

  @ManyToOne(() => Vehicle, vehicle => vehicle.routeExecutions, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ nullable: true })
  vehicleId: string;

  @Column()
  scheduledDate: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({
    type: 'text',
    default: ExecutionStatus.SCHEDULED,
  })
  status: ExecutionStatus;

  @Column({ type: 'int', default: 0 })
  plannedStops: number;

  @Column({ type: 'int', default: 0 })
  completedStops: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  totalDistance: number; // In kilometers

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fuelUsed: number; // In liters

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  wasteCollected: number; // In tons or cubic meters

  @Column({ nullable: true })
  wasteUnit: string; // 'tons', 'm3', etc.

  @Column({ type: 'int', nullable: true })
  startMileage: number;

  @Column({ type: 'int', nullable: true })
  endMileage: number;

  @Column({ nullable: true })
  startLocation: string;

  @Column({ nullable: true })
  endLocation: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  startLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  startLongitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  endLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  endLongitude: number;

  @Column({ type: 'text', nullable: true })
  routeGpsTrace: string; // JSON array of GPS coordinates

  @Column({ nullable: true })
  delayReason: string;

  @Column({ type: 'int', default: 0 })
  delayMinutes: number;

  @Column({ type: 'text', nullable: true })
  issues: string; // JSON array of issues encountered

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  driverRating: number; // Route-specific driver performance rating

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  residentSatisfaction: number; // Average resident feedback

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}