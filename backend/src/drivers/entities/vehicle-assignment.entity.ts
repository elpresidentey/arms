import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum AssignmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TEMPORARY = 'temporary',
}

@Entity('vehicle_assignments')
export class VehicleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, driver => driver.vehicleAssignments)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column()
  driverId: string;

  @ManyToOne(() => Vehicle, vehicle => vehicle.driverAssignments)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column()
  vehicleId: string;

  @Column()
  assignedDate: Date;

  @Column({ nullable: true })
  unassignedDate: Date;

  @Column({
    type: 'text',
    default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus;

  @Column({ nullable: true })
  reason: string; // Reason for assignment/unassignment

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}