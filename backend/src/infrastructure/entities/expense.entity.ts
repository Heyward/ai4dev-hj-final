import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum ExpenseStatus {
  TEMPORARY = 'temporary',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  PROCESSED = 'processed',
}

@Entity('expenses')
export class ExpenseEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  companyId: number;

  @Column({ type: 'varchar', nullable: true })
  receiptPath: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'varchar', nullable: true })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  providerId: string;

  @Column({ type: 'varchar', nullable: true })
  concept: string;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'integer', nullable: true })
  costCenterId: number;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.TEMPORARY,
  })
  status: ExpenseStatus;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
} 