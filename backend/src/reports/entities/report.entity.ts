import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReportType {
  MISSED_PICKUP = 'missed_pickup',
  ILLEGAL_DUMPING = 'illegal_dumping',
  DAMAGED_BINS = 'damaged_bins',
  TRUCK_ISSUE = 'truck_issue',
  OTHER = 'other',
}

export enum ReportStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ReportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketNumber: string;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column()
  reporterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ nullable: true })
  assignedToId: string;

  @Column({
    type: 'text',
  })
  type: ReportType;

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

  @Column({
    type: 'text',
    default: ReportStatus.SUBMITTED,
  })
  status: ReportStatus;

  @Column({
    type: 'text',
    default: ReportPriority.MEDIUM,
  })
  priority: ReportPriority;

  @Column('simple-array', { nullable: true })
  photoUrls: string[];

  @Column({ nullable: true })
  resolutionNotes: string;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  dueAt: Date;

  @Column({ nullable: true })
  firstResponseAt: Date;

  @Column({ nullable: true })
  escalatedAt: Date;

  @Column('simple-array', { nullable: true })
  resolutionEvidenceUrls: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
