import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseEntity, ExpenseStatus } from '../entities/expense.entity';
import { IExpenseRepository } from '../../domain/expense/interfaces/expense-repository.interface';
import { Expense } from '../../domain/expense/entities/expense.entity';

@Injectable()
export class ExpenseRepository implements IExpenseRepository {
  private readonly logger = new Logger(ExpenseRepository.name);

  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepository: Repository<ExpenseEntity>,
  ) {}

  async create(expense: Expense): Promise<Expense> {
    try {
      this.logger.log(`Creating expense for user ${expense.userId}`);
      
      const expenseEntity = this.mapToEntity(expense);
      const savedEntity = await this.expenseRepository.save(expenseEntity);
      
      return this.mapToDomain(savedEntity);
    } catch (error) {
      this.logger.error(`Error creating expense: ${error.message}`, error.stack);
      throw new Error(`Failed to create expense: ${error.message}`);
    }
  }

  async update(id: number, expenseData: Partial<Expense>): Promise<Expense> {
    try {
      this.logger.log(`Updating expense with ID ${id}`);
      
      const existingExpense = await this.expenseRepository.findOne({ where: { id } });
      
      if (!existingExpense) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      // Actualizar solo los campos proporcionados
      Object.assign(existingExpense, expenseData);
      
      const updatedEntity = await this.expenseRepository.save(existingExpense);
      
      return this.mapToDomain(updatedEntity);
    } catch (error) {
      this.logger.error(`Error updating expense: ${error.message}`, error.stack);
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  }

  async findById(id: number): Promise<Expense | null> {
    try {
      this.logger.log(`Finding expense with ID ${id}`);
      
      const expenseEntity = await this.expenseRepository.findOne({ 
        where: { id },
        select: {
          id: true,
          userId: true,
          companyId: true,
          receiptPath: true,
          amount: true,
          provider: true,
          providerId: true,
          concept: true,
          date: true,
          currency: true,
          costCenterId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true
        }
      });
      
      if (!expenseEntity) {
        return null;
      }
      
      return this.mapToDomain(expenseEntity);
    } catch (error) {
      this.logger.error(`Error finding expense: ${error.message}`, error.stack);
      throw new Error(`Failed to find expense: ${error.message}`);
    }
  }

  async findByUserId(userId: number): Promise<Expense[]> {
    try {
      this.logger.log(`Finding expenses for user ${userId}`);
      
      const expenseEntities = await this.expenseRepository.find({ where: { userId } });
      
      return expenseEntities.map(entity => this.mapToDomain(entity));
    } catch (error) {
      this.logger.error(`Error finding expenses by user: ${error.message}`, error.stack);
      throw new Error(`Failed to find expenses by user: ${error.message}`);
    }
  }

  async confirmExpense(id: number): Promise<Expense> {
    try {
      this.logger.log(`Confirming expense with ID ${id}`);
      
      const existingExpense = await this.expenseRepository.findOne({ where: { id } });
      
      if (!existingExpense) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      existingExpense.status = ExpenseStatus.CONFIRMED;
      
      const updatedEntity = await this.expenseRepository.save(existingExpense);
      
      return this.mapToDomain(updatedEntity);
    } catch (error) {
      this.logger.error(`Error confirming expense: ${error.message}`, error.stack);
      throw new Error(`Failed to confirm expense: ${error.message}`);
    }
  }

  async rejectExpense(id: number): Promise<Expense> {
    try {
      this.logger.log(`Rejecting expense with ID ${id}`);
      
      const existingExpense = await this.expenseRepository.findOne({ where: { id } });
      
      if (!existingExpense) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      existingExpense.status = ExpenseStatus.REJECTED;
      
      const updatedEntity = await this.expenseRepository.save(existingExpense);
      
      return this.mapToDomain(updatedEntity);
    } catch (error) {
      this.logger.error(`Error rejecting expense: ${error.message}`, error.stack);
      throw new Error(`Failed to reject expense: ${error.message}`);
    }
  }

  // Métodos de mapeo entre dominio y entidad
  private mapToEntity(expense: Expense): ExpenseEntity {
    const entity = new ExpenseEntity();
    
    if (expense.id) {
      entity.id = expense.id;
    }
    
    entity.userId = expense.userId;
    entity.companyId = expense.companyId;
    entity.receiptPath = expense.receiptPath;
    entity.amount = expense.amount;
    entity.provider = expense.provider;
    entity.providerId = expense.providerId;
    entity.concept = expense.concept;
    entity.date = expense.date;
    entity.currency = expense.currency;
    entity.costCenterId = expense.costCenterId;
    entity.status = expense.status as ExpenseStatus;
    entity.additionalData = expense.additionalData || {};
    
    return entity;
  }

  private mapToDomain(entity: ExpenseEntity): Expense {
    return new Expense({
      id: entity.id,
      userId: entity.userId,
      companyId: entity.companyId,
      receiptPath: entity.receiptPath,
      amount: entity.amount,
      provider: entity.provider,
      providerId: entity.providerId,
      concept: entity.concept,
      date: entity.date,
      currency: entity.currency,
      costCenterId: entity.costCenterId,
      status: entity.status,
      additionalData: entity.additionalData,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
} 