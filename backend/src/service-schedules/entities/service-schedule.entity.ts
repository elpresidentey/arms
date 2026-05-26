import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('service_schedules')
@Index(['ward', 'street'])
@Index(['status', 'publishedDate'])
@Index(['serviceType', 'status'])
export class ServiceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scheduleCode: string;

  @Column()
  serviceType: string; // e.g., 'waste_collection', 'bulky_pickup', 'bin_replacement'

  @Column()
  ward: string;

  @Column({ nullable: true })
  street: string;

  @Column()
  zone: string;

  @Column()
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed';

  @Column({ type: 'simple-array' })
  serviceDays: string[]; // e.g., ['Monday', 'Wednesday', 'Friday']

  @Column()
  startTimeWindow: string; // e.g., '08:00'

  @Column()
  endTimeWindow: string; // e.g., '17:00'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  operatorName: string;

  @Column({ nullable: true })
  operatorPhoneNumber: string;

  @Column({ nullable: true })
  operatorEmail: string;

  @Column({ type: 'simple-array', nullable: true })
  serviceProviders: string[]; // Names of service providers/operators

  @Column({ type: 'timestamp', nullable: true })
  publishedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  effectiveFromDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  effectiveToDate: Date;

  @Column({ default: 'draft' })
  status: 'draft' | 'published' | 'archived' | 'suspended';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  publishedById: string;

  @ManyToOne(() => User, { nullable: true })
  publishedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
