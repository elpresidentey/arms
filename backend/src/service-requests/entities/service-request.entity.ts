import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ServiceRequestType {
  BIN_REPLACEMENT = 'bin_replacement',
  NEW_BIN = 'new_bin',
  BULKY_PICKUP = 'bulky_pickup',
  MISSED_PICKUP_FOLLOW_UP = 'missed_pickup_follow_up',
  SERVICE_TRANSFER = 'service_transfer',
  PROPERTY_ONBOARDING = 'property_onboarding',
}

export enum ServiceRequestStatus {
  SUBMITTED = 'submitted',
  TRIAGED = 'triaged',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ESCALATED = 'escalated',
}

export enum ServiceRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resident_id' })
  resident: User;

  @Column()
  residentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ nullable: true })
  assignedToId: string;

  @Column({ type: 'text' })
  type: ServiceRequestType;

  @Column({ type: 'text', default: ServiceRequestStatus.SUBMITTED })
  status: ServiceRequestStatus;

  @Column({ type: 'text', default: ServiceRequestPriority.MEDIUM })
  priority: ServiceRequestPriority;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  address: string;

  @Column()
  ward: string;

  @Column()
  street: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  preferredDate: Date;

  @Column({ nullable: true })
  scheduledFor: Date;

  @Column({ nullable: true })
  slaDueAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  resolutionNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
