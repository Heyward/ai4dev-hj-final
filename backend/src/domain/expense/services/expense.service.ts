import { Injectable, Inject, Logger } from '@nestjs/common';
import { Expense, ExpenseStatus } from '../entities/expense.entity';
import { IExpenseRepository } from '../interfaces/expense-repository.interface';
import { IReceiptProcessor } from '../interfaces/receipt-processor.interface';
import { IFileStorageService } from '../../shared/interfaces/file-storage.interface';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    @Inject('IExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('IReceiptProcessor')
    private readonly receiptProcessor: IReceiptProcessor,
    @Inject('IFileStorageService')
    private readonly fileStorageService: IFileStorageService,
  ) {}

  /**
   * Crea un gasto a partir de un recibo subido por el usuario
   * Este método maneja tanto la subida del archivo como la creación del gasto
   */
  async createExpenseFromReceipt(
    userId: number,
    companyId: number,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<Expense> {
    this.logger.log(`Creating expense from receipt for user ${userId}, company ${companyId}`);
    
    // 1. Subir el archivo a S3
    const uploadResult = await this.fileStorageService.uploadFile(
      fileBuffer,
      fileName,
      mimeType
    );
    
    this.logger.log(`File uploaded successfully to ${uploadResult.url}`);
    
    // 2. Crear el gasto temporal con la URL de S3
    return this.createTemporaryExpense(
      userId,
      companyId,
      uploadResult.url
    );
  }

  /**
   * Crea un gasto temporal con la información básica
   * y dispara el proceso asíncrono de extracción de datos
   */
  async createTemporaryExpense(
    userId: number,
    companyId: number,
    receiptPath: string,
  ): Promise<Expense> {
    const expense = new Expense({
      userId,
      companyId,
      receiptPath,
      status: ExpenseStatus.TEMPORARY,
    });

    const savedExpense = await this.expenseRepository.create(expense);

    // Iniciar el proceso de extracción de datos de forma asíncrona
    this.processReceiptAsync(savedExpense.id, receiptPath);

    return savedExpense;
  }

  /**
   * Procesa el recibo de forma asíncrona y actualiza el gasto con los datos extraídos
   */
  private processReceiptAsync(expenseId: number, receiptPath: string): void {
    this.receiptProcessor
      .processReceipt(receiptPath)
      .then(async (receiptData) => {
        // Extraer los campos principales
        const { amount, provider, providerId, concept, date, additionalData } = receiptData;
        
        // Crear un objeto con los campos principales
        const updatedExpense: Partial<Expense> = {
          amount,
          provider,
          providerId,
          concept,
          date,
          additionalData,
          status: ExpenseStatus.PROCESSED
        };
        
        // Si hay datos adicionales, añadirlos al objeto de actualización
        if (Object.keys(additionalData).length > 0) {
          updatedExpense.additionalData = additionalData;
        }
        
        await this.expenseRepository.update(expenseId, updatedExpense);
        this.logger.log(`Expense ${expenseId} updated with extracted data and marked as PROCESSED`);
      })
      .catch((error) => {
        this.logger.error(`Error processing receipt: ${error.message}`, error.stack);
        // Aquí podríamos implementar un sistema de reintentos o notificaciones
      });
  }

  async confirmExpense(id: number): Promise<Expense> {
    return this.expenseRepository.confirmExpense(id);
  }

  async rejectExpense(id: number): Promise<Expense> {
    return this.expenseRepository.rejectExpense(id);
  }

  async findById(id: number): Promise<Expense | null> {
    return this.expenseRepository.findById(id);
  }

  async getUserExpenses(userId: number): Promise<Expense[]> {
    return this.expenseRepository.findByUserId(userId);
  }

  async delete(id: number): Promise<void> {
    // ... existing code ...
  }
} 