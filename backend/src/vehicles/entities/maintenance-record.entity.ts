import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { User } from '../../users/entities/user.entity';

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  INSPECTION = 'inspection',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('maintenance_records')
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, vehicle => vehicle.maintenanceRecords)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column()
  vehicleId: string;

  @Column({
    type: 'text',
    default: MaintenanceType.PREVENTIVE,
  })
  maintenanceType: MaintenanceType;

  @Column({
    type: 'text',
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({
    type: 'text',
    default: MaintenancePriority.MEDIUM,
  })
  priority: MaintenancePriority;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  scheduledDate: Date;

  @Column({ nullable: true })
  startedDate: Date;

  @Column({ nullable: true })
  completedDate: Date;

  @Column({ type: 'int', nullable: true })
  mileageAtMaintenance: number;

  @Column({ nullable: true })
  serviceProvider: string;

  @Column({ nullable: true })
  technician: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'text', nullable: true })
  partsUsed: string; // JSON array of parts

  @Column({ type: 'text', nullable: true })
  workPerformed: string; // Detailed work description

  @Column({ nullable: true })
  nextServiceDue: Date;

  @Column({ type: 'int', nullable: true })
  nextServiceMileage: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @Column({ type: 'text', nullable: true })
  attachments: string; // JSON array of file URLs

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}