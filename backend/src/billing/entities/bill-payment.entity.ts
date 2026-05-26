import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bill } from './bill.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('bill_payments')
export class BillPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  billId: string;

  @ManyToOne(() => Bill)
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ unique: true })
  paymentReference: string;

  @Column()
  paymentMethod: string;

  @Column({
    type: 'text',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  paystackReference: string;

  @Column({ nullable: true })
  paystackAccessCode: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
