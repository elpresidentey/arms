import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VehicleAssignment } from './vehicle-assignment.entity';
import { RouteExecution } from '../../route-executions/entities/route-execution.entity';

export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
}

export enum LicenseClass {
  CLASS_A = 'class_a', // Heavy trucks
  CLASS_B = 'class_b', // Medium trucks
  CLASS_C = 'class_c', // Light vehicles
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  driverCode: string; // DR001, DR002, etc.

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column()
  licenseNumber: string;

  @Column({
    type: 'text',
    default: LicenseClass.CLASS_C,
  })
  licenseClass: LicenseClass;

  @Column()
  licenseExpiryDate: Date;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  @Column()
  hireDate: Date;

  @Column({
    type: 'text',
    default: DriverStatus.ACTIVE,
  })
  status: DriverStatus;

  @Column({ type: 'text', nullable: true })
  specializations: string; // JSON array of specialized equipment certifications

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  performanceRating: number; // 0.00 to 5.00

  @Column({ type: 'int', default: 0 })
  totalRoutes: number;

  @Column({ type: 'int', default: 0 })
  completedRoutes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageCompletionTime: number; // Average hours per route

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => VehicleAssignment, assignment => assignment.driver)
  vehicleAssignments: VehicleAssignment[];

  @OneToMany(() => RouteExecution, execution => execution.driver)
  routeExecutions: RouteExecution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}