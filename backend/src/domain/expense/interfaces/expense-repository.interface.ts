import { Expense } from '../entities/expense.entity';

export interface IExpenseRepository {
  create(expense: Expense): Promise<Expense>;
  update(id: number, expenseData: Partial<Expense>): Promise<Expense>;
  findById(id: number): Promise<Expense | null>;
  findByUserId(userId: number): Promise<Expense[]>;
  confirmExpense(id: number): Promise<Expense>;
  rejectExpense(id: number): Promise<Expense>;
} 