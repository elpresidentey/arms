import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionSource {
  RECYCLABLES = 'recyclables',
  REWARD_POINTS = 'reward_points',
  WITHDRAWAL = 'withdrawal',
  BONUS = 'bonus',
  PENALTY = 'penalty',
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'text',
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter: number;

  @Column({
    type: 'text',
  })
  source: TransactionSource;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  referenceId: string; // Links to recyclable, collection, etc.

  @Column({ nullable: true })
  externalTransactionId: string; // Paystack/Flutterwave reference

  @Column({ nullable: true, default: 'approved' })
  status: string; // pending, approved, rejected, failed

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional data like account details, approval info

  @CreateDateColumn()
  createdAt: Date;
}