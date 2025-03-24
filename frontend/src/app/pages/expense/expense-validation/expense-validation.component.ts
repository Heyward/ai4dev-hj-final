import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationType } from '../../../core/services/notification.service';

@Component({
  selector: 'app-expense-validation',
  templateUrl: './expense-validation.component.html',
  styleUrls: ['./expense-validation.component.scss']
})
export class ExpenseValidationComponent implements OnInit {
  @Input() expenseData: any;
  @Output() expenseConfirmed = new EventEmitter<any>();
  
  validationForm: FormGroup;
  isSubmitting: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private expenseService: ExpenseService,
    private notificationService: NotificationService
  ) {
    this.validationForm = this.formBuilder.group({
      date: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0)]],
      provider: ['', [Validators.required]],
      provider_id: ['', [Validators.required]],
      concept: ['', [Validators.required]],
      cost_center_id: [''],
      currency: ['COP'] // Valor por defecto
    });
  }

  ngOnInit(): void {
    this.updateFormWithOcrData();
  }

  ngOnChanges(): void {
    this.updateFormWithOcrData();
  }

  updateFormWithOcrData(): void {
    if (this.expenseData) {
      // Notificar al usuario que los datos han sido cargados
      this.notificationService.info('Datos extraídos por OCR cargados. Por favor, verifique y corrija si es necesario.');
      
      // Actualizar el formulario con los datos extraídos por OCR
      this.validationForm.patchValue({
        date: this.formatDateForInput(this.expenseData.date || ''),
        amount: this.expenseData.amount || '',
        provider: this.expenseData.provider || '',
        provider_id: this.expenseData.provider_id || '',
        concept: this.expenseData.concept || '',
        cost_center_id: this.expenseData.cost_center_id || '',
        currency: this.expenseData.currency || 'COP'
      });
    }
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    // Convertir la fecha al formato YYYY-MM-DD para el input type="date"
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  onSubmit(): void {
    if (this.validationForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.validationForm.controls).forEach(key => {
        const control = this.validationForm.get(key);
        control?.markAsTouched();
      });
      
      this.notificationService.error('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }

    // Confirmar antes de enviar
    this.notificationService.showConfirmation(
      'Confirmar gasto',
      '¿Está seguro de que desea confirmar este gasto con los datos proporcionados?',
      'Sí, confirmar',
      'Cancelar'
    ).then((confirmed) => {
      if (confirmed) {
        this.notificationService.success('En construcción...');
        // this.submitForm();
      }
    });
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    const formData = this.validationForm.value;
    
    this.expenseService.confirmExpense(this.expenseData.id, formData)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = 'Gasto confirmado correctamente';
          this.notificationService.showAlert(
            '¡Gasto confirmado!',
            'El gasto ha sido registrado correctamente en el sistema.',
            NotificationType.SUCCESS
          );
          this.expenseConfirmed.emit(response);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Error al confirmar el gasto: ' + error.message;
          this.notificationService.error('Error al confirmar el gasto: ' + error.message);
        }
      });
  }

  // Getters para acceder fácilmente a los controles del formulario en la plantilla
  get f() { return this.validationForm.controls; }
} 