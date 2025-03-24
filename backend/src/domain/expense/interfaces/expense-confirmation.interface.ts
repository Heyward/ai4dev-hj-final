export interface ExpenseConfirmationData {
  amount: number;
  provider: string;
  providerId: string;
  concept: string;
  date: Date;
  costCenterId?: string;
  currency: string;
} 