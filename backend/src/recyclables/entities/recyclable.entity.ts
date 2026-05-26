import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RecyclableType {
  PLASTIC_BOTTLES = 'plastic_bottles',
  GLASS_BOTTLES = 'glass_bottles',
  ALUMINUM_CANS = 'aluminum_cans',
  CARDBOARD = 'cardboard',
  PAPER = 'paper',
  METAL_SCRAPS = 'metal_scraps',
  ELECTRONICS = 'electronics',
  OTHER = 'other',
}

export enum RecyclableStatus {
  LOGGED = 'logged',
  PICKUP_REQUESTED = 'pickup_requested',
  COLLECTED = 'collected',
  PROCESSED = 'processed',
  PAID = 'paid',
}

@Entity('recyclables')
export class Recyclable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.recyclables)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recycler_id' })
  recycler: User;

  @Column({ nullable: true })
  recyclerId: string;

  @Column({
    type: 'text',
  })
  type: RecyclableType;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  quantity: number;

  @Column()
  unit: string; // kg, pieces, liters, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualValue: number;

  @Column({
    type: 'text',
    default: RecyclableStatus.LOGGED,
  })
  status: RecyclableStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  pickupDate: Date;

  @Column({ nullable: true })
  collectionDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}