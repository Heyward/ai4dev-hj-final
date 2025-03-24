import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseController } from './infrastructure/controllers/expense.controller';
import { ExpenseService } from './domain/expense/services/expense.service';
import { ExpenseRepository } from './infrastructure/repositories/expense.repository';
import { AwsTextractService } from './infrastructure/services/aws-textract.service';
import { AwsS3Service } from './infrastructure/services/aws-s3.service';
import { ExpenseEntity } from './infrastructure/entities/expense.entity';
import { getDatabaseConfig } from './infrastructure/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    TypeOrmModule.forFeature([ExpenseEntity]),
  ],
  controllers: [ExpenseController],
  providers: [
    ExpenseService,
    {
      provide: 'IExpenseRepository',
      useClass: ExpenseRepository,
    },
    {
      provide: 'IReceiptProcessor',
      useClass: AwsTextractService,
    },
    {
      provide: 'IFileStorageService',
      useClass: AwsS3Service,
    },
  ],
})
export class AppModule {}
