export enum ExpenseStatus {
  TEMPORARY = 'temporary',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  PROCESSED = 'processed',
}

export class Expense {
  id: number;
  userId: number;
  companyId: number;
  receiptPath: string;
  amount: number;
  provider: string;
  providerId: string;
  concept: string;
  date: Date;
  currency: string;
  costCenterId: number;
  status: ExpenseStatus;
  additionalData: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: Partial<Expense>) {
    this.id = data.id || 0;
    this.userId = data.userId || 0;
    this.companyId = data.companyId || 0;
    this.receiptPath = data.receiptPath || '';
    this.amount = data.amount || 0;
    this.provider = data.provider || '';
    this.providerId = data.providerId || '';
    this.concept = data.concept || '';
    this.date = data.date || new Date();
    this.currency = data.currency || '';
    this.costCenterId = data.costCenterId || 0;
    this.status = data.status || ExpenseStatus.TEMPORARY;
    this.additionalData = data.additionalData || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
} 