import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @Output() fileSelected = new EventEmitter<File>();
  @Output() expenseCreated = new EventEmitter<any>();
  
  public config: DropzoneConfigInterface = {
    clickable: true,
    maxFiles: 1,
    autoReset: null,
    errorReset: null,
    cancelReset: null,
    // acceptedFiles: 'image/*',
    maxFilesize: 5, // 5MB
    previewTemplate: this.getPreviewTemplate()
  };

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  uploadSuccess: boolean = false;
  expenseId: string | null = null;

  constructor(
    private expenseService: ExpenseService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    this.errorMessage = null;
    this.uploadSuccess = false;
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|bmp|webp)/)) {
        this.errorMessage = 'Por favor, seleccione un archivo de imagen válido (JPG, PNG, GIF, BMP, WEBP)';
        this.notificationService.error('Formato de archivo no válido. Por favor, seleccione una imagen.');
        return;
      }
      
      // Validar tamaño de archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.';
        this.notificationService.error('El archivo es demasiado grande. El tamaño máximo permitido es 5MB.');
        return;
      }
      
      this.selectedFile = file;
      this.fileSelected.emit(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result || null;
      };
      reader.readAsDataURL(file);
      
      // Iniciar la carga automáticamente
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = null;
    
    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 300);
    
    this.expenseService.uploadReceipt(file, '1', '1').subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.uploadSuccess = true;
        this.expenseId = response.id;
        this.isUploading = false;
        
        // Notificar al usuario
        this.notificationService.success('Imagen cargada correctamente. Procesando OCR...');
        
        // Emitir evento de creación de gasto
        this.expenseCreated.emit({processingState: 'extracting'});
                
        console.log('response');
        console.log(response.status);
        console.log(response.data);
        // Iniciar polling para verificar el estado del OCR
        if (response.data.status === 'temporary') {
          this.checkOcrStatus(response.data.expenseId);
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.errorMessage = `Error al cargar la imagen: ${error.message}`;
        this.notificationService.error(`Error al cargar la imagen: ${error.message}`);
      }
    });
  }

  checkOcrStatus(expenseId: string): void {
    console.log('Checking OCR status for expenseId:', expenseId);
    let attempts = 0;
    const maxAttempts = 10;
    
    const statusCheck = setInterval(() => {
      console.log('Checking OCR status for expenseId:', expenseId, 'Attempt:', attempts);
      attempts++;
      
      this.expenseService.getExpenseStatus(expenseId).subscribe({
        next: (response) => {
          console.log('OCR status response:', response);
          if (response.data.expense.status !== 'temporary') {
            clearInterval(statusCheck);
            
            this.expenseCreated.emit({...response?.data?.expense, processingState: 'extracted'});
            
            // Notificar al usuario
            this.notificationService.success('Procesamiento OCR completado. Verifique los datos extraídos.');
          } else if (attempts >= maxAttempts) {
            clearInterval(statusCheck);
            this.isUploading = false;
            this.notificationService.warning('El procesamiento OCR está tomando más tiempo de lo esperado. Los datos estarán disponibles en breve.');
          }
        },
        error: (error) => {
          clearInterval(statusCheck);
          this.isUploading = false;
          this.errorMessage = `Error al verificar el estado del OCR: ${error.message}`;
          this.notificationService.error(`Error al verificar el estado del OCR: ${error.message}`);
        }
      });
    }, 3000); // Verificar cada 3 segundos
    
    // Detener el polling después de 30 segundos para evitar bucles infinitos
    setTimeout(() => {
      clearInterval(statusCheck);
    }, 30000);
  }

  resetUpload(): void {
    // Preguntar al usuario si está seguro de querer eliminar la imagen
    this.notificationService.showConfirmation(
      '¿Eliminar imagen?',
      '¿Está seguro de que desea eliminar esta imagen? Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar'
    ).then((confirmed) => {
      if (confirmed) {
        this.selectedFile = null;
        this.previewUrl = null;
        this.errorMessage = null;
        this.isUploading = false;
        this.uploadProgress = 0;
        this.uploadSuccess = false;
        this.expenseId = null;
        this.notificationService.info('Imagen eliminada. Puede seleccionar otra imagen.');
        this.expenseCreated.emit({processingState: 'waiting'});
      }
    });
  }

  private getPreviewTemplate(): string {
    return `
      <div class="dz-preview dz-file-preview">
        <div class="dz-image">
          <img data-dz-thumbnail />
        </div>
        <div class="dz-details">
          <div class="dz-size"><span data-dz-size></span></div>
          <div class="dz-filename"><span data-dz-name></span></div>
        </div>
        <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
        <div class="dz-error-message"><span data-dz-errormessage></span></div>
      </div>
    `;
  }
} 