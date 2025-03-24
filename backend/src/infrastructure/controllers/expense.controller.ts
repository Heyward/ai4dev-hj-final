import { Controller, Post, Get, Param, Body, UseInterceptors, UploadedFile, Logger, HttpException, HttpStatus, Inject, ParseIntPipe, Delete } from '@nestjs/common';
import { ExpenseService } from '../../domain/expense/services/expense.service';
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ExpenseConfirmationData } from '../../domain/expense/interfaces/expense-confirmation.interface';

@Controller('api/expenses')
export class ExpenseController {
  private readonly logger = new Logger(ExpenseController.name);

  constructor(
    private readonly expenseService: ExpenseService,
  ) {}

  @Post('ocr')
  @UseInterceptors(FileInterceptor('receipt', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB límite
    }
  }))
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
    @Body('companyId') companyId: number,
  ) {
    try {
      this.logger.log(`Received request with file: ${file ? 'yes' : 'no'}`);
      if (file) {
        this.logger.log(`File details: ${JSON.stringify({
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        })}`);
      }
      
      if (!file) {
        throw new HttpException('Receipt file is required', HttpStatus.BAD_REQUEST);
      }
      
      if (!userId) {
        throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
      }
      
      if (!companyId) {
        throw new HttpException('companyId is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Processing receipt upload for user ${userId}, company ${companyId}`);
      
      // Delegar toda la lógica al servicio
      const expense = await this.expenseService.createExpenseFromReceipt(
        userId,
        companyId,
        file.buffer,
        file.originalname,
        file.mimetype
      );

      return {
        status: 'success',
        data: {
          expenseId: expense.id,
          status: expense.status,
          receiptUrl: expense.receiptPath,
          message: 'Receipt uploaded successfully and processing started',
        },
      };
    } catch (error) {
      this.logger.error(`Error processing receipt upload: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to process receipt: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/confirm')
  async confirmExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() confirmationData: ExpenseConfirmationData
  ) {
    try {
      const expense = await this.expenseService.confirmExpense(id, confirmationData);
      
      return {
        status: 'success',
        data: {
          expense,
          message: 'Expense confirmed successfully',
        },
      };
    } catch (error) {
      this.logger.error(`Error confirming expense: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to confirm expense: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/reject')
  async rejectExpense(@Param('id') id: number) {
    try {
      const expense = await this.expenseService.rejectExpense(id);
      
      return {
        status: 'success',
        data: {
          expense,
          message: 'Expense rejected successfully',
        },
      };
    } catch (error) {
      this.logger.error(`Error rejecting expense: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to reject expense: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const expense = await this.expenseService.findById(id); 
      
      if (!expense) {
        throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        status: 'success',
        data: {
          expense,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting expense: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to get expense: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('user/:userId')
  async getUserExpenses(@Param('userId') userId: number) {
    try {
      const expenses = await this.expenseService.getUserExpenses(userId);
      
      return {
        status: 'success',
        data: {
          expenses,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting user expenses: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to get user expenses: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // ... existing code ...
  }
} 