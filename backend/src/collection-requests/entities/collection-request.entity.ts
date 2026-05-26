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
import { CollectionRoute } from '../../collection-routes/entities/collection-route.entity';

export enum CollectionRequestType {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  BULKY = 'bulky',
  SPECIAL = 'special',
}

export enum CollectionRequestStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('collection_requests')
export class CollectionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  residentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'residentId' })
  resident: User;

  @Column()
  address: string;

  @Column()
  ward: string;

  @Column()
  street: string;

  @Column({ nullable: true })
  latitude: number;

  @Column({ nullable: true })
  longitude: number;

  @Column({
    type: 'text',
    enum: CollectionRequestType,
    default: CollectionRequestType.ROUTINE,
  })
  type: CollectionRequestType;

  @Column({
    type: 'text',
    enum: CollectionRequestStatus,
    default: CollectionRequestStatus.PENDING,
  })
  status: CollectionRequestStatus;

  @Column({ nullable: true })
  preferredDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  routeId: string;

  @ManyToOne(() => CollectionRoute, { nullable: true })
  @JoinColumn({ name: 'routeId' })
  route: CollectionRoute;

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
