import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CollectionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
  VERIFIED = 'verified',
}

@Entity('waste_collections')
export class WasteCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.wasteCollections)
  @JoinColumn({ name: 'resident_id' })
  resident: User;

  @Column()
  residentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'psp_operator_id' })
  pspOperator: User;

  @Column({ nullable: true })
  pspOperatorId: string;

  @Column({ nullable: true })
  routeId: string;

  @Column({
    type: 'text',
    default: CollectionStatus.SCHEDULED,
  })
  status: CollectionStatus;

  @Column()
  scheduledDate: Date;

  @Column({ nullable: true })
  actualCollectionTime: Date;

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
  notes: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  scheduledTruckCode: string;

  @Column({ nullable: true })
  reportedTruckCode: string;

  @Column({ default: false })
  residentConfirmed: boolean;

  @Column({ nullable: true })
  residentConfirmedAt: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
