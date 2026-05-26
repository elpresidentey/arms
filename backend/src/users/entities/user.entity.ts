import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WasteCollection } from '../../waste-collection/entities/waste-collection.entity';
import { Recyclable } from '../../recyclables/entities/recyclable.entity';
import { WalletTransaction } from '../../wallet/entities/wallet.entity';
import { Report } from '../../reports/entities/report.entity';

export enum UserRole {
  RESIDENT = 'resident',
  PSP_OPERATOR = 'psp_operator',
  RECYCLER = 'recycler',
  ADMIN = 'admin',
  WARD_OFFICER = 'ward_officer',
  SUPERVISOR = 'supervisor',
  DISPATCHER = 'dispatcher',
  FINANCE_OFFICER = 'finance_officer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string | null;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  ward: string;

  @Column({ nullable: true })
  houseNumber: string;

  @Column()
  street: string;

  @Column({ nullable: true })
  serviceZone: string;

  @Column({ nullable: true })
  propertyType: string;

  @Column({ nullable: true })
  landmark: string;

  @Column({ type: 'int', nullable: true })
  householdSize: number;

  @Column({
    type: 'text',
    default: UserRole.RESIDENT,
  })
  role: UserRole;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ default: true })
  isActive: boolean;

  // Bank details for payouts
  @Column({ nullable: true })
  bankCode: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  paystackRecipientCode: string;

  @Column({ default: false })
  isBankVerified: boolean;

  @OneToMany(() => WasteCollection, collection => collection.resident)
  wasteCollections: WasteCollection[];

  @OneToMany(() => Recyclable, recyclable => recyclable.user)
  recyclables: Recyclable[];

  @OneToMany(() => WalletTransaction, wallet => wallet.user)
  wallets: WalletTransaction[];

  @OneToMany(() => Report, report => report.reporter)
  reports: Report[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
