import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Componentes
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ExpenseCreateComponent } from './expense-create/expense-create.component';
import { ExpenseValidationComponent } from './expense-validation/expense-validation.component';

// Servicios
import { NotificationService } from '../../core/services/notification.service';

// Módulos de terceros
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  maxFilesize: 5, // 5MB
  acceptedFiles: 'image/*',
  autoProcessQueue: false
};

@NgModule({
  declarations: [
    FileUploadComponent,
    ExpenseCreateComponent,
    ExpenseValidationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DropzoneModule
  ],
  exports: [
    FileUploadComponent,
    ExpenseCreateComponent,
    ExpenseValidationComponent
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    },
    NotificationService
  ]
})
export class ExpenseModule { } 