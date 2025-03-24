import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificationType } from '../../../core/services/notification.service';

type ProcessingState = 'waiting' | 'uploading' | 'extracting' | 'extracted';

@Component({
  selector: 'app-expense-create',
  templateUrl: './expense-create.component.html'
})
export class ExpenseCreateComponent implements OnInit {
  selectedFile: File | null = null;
  expenseData: any = null;
  isExtracted = false;
  isExpenseConfirmed = false;
  confirmedExpenseData: any = null; 
  processingState: ProcessingState = 'waiting';

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.info('Bienvenido al sistema de registro de gastos. Comience cargando una imagen de comprobante.');
  }

  handleFileSelected(file: File): void {
    this.selectedFile = file;
    this.isExpenseConfirmed = false;
    this.confirmedExpenseData = null;
    this.expenseData = null;
    this.isExtracted = false;
    this.processingState = 'uploading';
    console.log('Archivo seleccionado:', file);
  }
  
  handleExpenseCreated(expenseData: any): void {
    this.expenseData = expenseData;
    console.log('Datos recibidos:', expenseData);
    expenseData.provider_id = expenseData.providerId;
    
    this.processingState = expenseData.processingState;
    this.isExtracted = expenseData.processingState === 'extracted';
    
    if (expenseData?.data) {
      this.updateFormWithOcrData(expenseData.data);
    }
  }
  
  handleExpenseConfirmed(confirmedData: any): void {
    this.isExpenseConfirmed = true;
    this.confirmedExpenseData = confirmedData;
    this.isExtracted = false;
    this.processingState = 'waiting';
    console.log('Gasto confirmado:', confirmedData);
    
    // Mostrar notificación de éxito
    this.notificationService.showAlert(
      '¡Proceso completado!',
      'El gasto ha sido registrado exitosamente en el sistema.',
      NotificationType.SUCCESS
    );
  }
  
  private updateFormWithOcrData(data: any): void {
    // Esta función se implementará en el ticket de formulario de gastos
    // Por ahora, solo registramos que los datos están disponibles
    console.log('Datos OCR disponibles para actualizar el formulario:', data);
  }
  
  resetForm(): void {
    this.selectedFile = null;
    this.expenseData = null;
    this.isExtracted = false;
    this.isExpenseConfirmed = false;
    this.confirmedExpenseData = null;
    this.processingState = 'waiting';
    
    // Mostrar notificación
    this.notificationService.info('Formulario reiniciado. Puede registrar un nuevo gasto.');
  }

  // Add these helper methods for template
  isWaiting(): boolean {
    return this.processingState === 'waiting';
  }

  getStateClasses() {
    return {
      'alert-info': this.isWaiting(),
      'alert-warning': !this.isWaiting(),
      'text-info': this.isWaiting(),
      'text-warning': !this.isWaiting()
    };
  }
} 