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

export enum RouteFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum RouteStatus {
  ACTIVE = 'active',
  DISRUPTED = 'disrupted',
  INACTIVE = 'inactive',
}

@Entity('collection_routes')
export class CollectionRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  routeCode: string;

  @Column()
  name: string;

  @Column()
  ward: string;

  @Column()
  street: string;

  @Column({ nullable: true })
  zone: string;

  @Column({
    type: 'text',
    default: RouteFrequency.WEEKLY,
  })
  frequency: RouteFrequency;

  @Column()
  serviceDay: string;

  @Column()
  startTimeWindow: string;

  @Column()
  endTimeWindow: string;

  @Column()
  nextCollectionDate: Date;

  @Column({ nullable: true })
  lastCompletedAt: Date;

  @Column({
    type: 'text',
    default: RouteStatus.ACTIVE,
  })
  status: RouteStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'psp_operator_id' })
  pspOperator: User;

  @Column({ nullable: true })
  pspOperatorId: string;

  @Column({ nullable: true })
  truckCode: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
