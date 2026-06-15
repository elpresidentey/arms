import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VehicleAssignment } from '../../drivers/entities/vehicle-assignment.entity';
import { MaintenanceRecord } from './maintenance-record.entity';
import { RouteExecution } from '../../route-executions/entities/route-execution.entity';

export enum VehicleStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  RETIRED = 'retired',
}

export enum VehicleType {
  COMPACTOR_TRUCK = 'compactor_truck',
  OPEN_TRUCK = 'open_truck',
  TIPPER_TRUCK = 'tipper_truck',
  MINI_TRUCK = 'mini_truck',
  TRICYCLE = 'tricycle',
}

export enum FuelType {
  DIESEL = 'diesel',
  PETROL = 'petrol',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  vehicleCode: string; // TR001, TR002, etc. (replaces truckCode)

  @Column()
  plateNumber: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({
    type: 'text',
    default: VehicleType.OPEN_TRUCK,
  })
  vehicleType: VehicleType;

  @Column({
    type: 'text',
    default: FuelType.DIESEL,
  })
  fuelType: FuelType;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  capacity: number; // In cubic meters or tons

  @Column()
  capacityUnit: string; // 'm3', 'tons', etc.

  @Column({
    type: 'text',
    default: VehicleStatus.OPERATIONAL,
  })
  status: VehicleStatus;

  @Column()
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ nullable: true })
  insuranceExpiry: Date;

  @Column({ nullable: true })
  registrationExpiry: Date;

  @Column({ nullable: true })
  lastServiceDate: Date;

  @Column({ nullable: true })
  nextServiceDue: Date;

  @Column({ type: 'int', default: 0 })
  currentMileage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  fuelEfficiency: number; // km per liter or equivalent

  @Column({ type: 'int', default: 0 })
  totalRoutes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageDowntime: number; // Average days in maintenance

  @Column({ nullable: true })
  currentLocation: string; // Last known location or depot

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => VehicleAssignment, assignment => assignment.vehicle)
  driverAssignments: VehicleAssignment[];

  @OneToMany(() => MaintenanceRecord, record => record.vehicle)
  maintenanceRecords: MaintenanceRecord[];

  @OneToMany(() => RouteExecution, execution => execution.vehicle)
  routeExecutions: RouteExecution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}