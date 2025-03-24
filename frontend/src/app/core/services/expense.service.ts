import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GlobalComponent } from 'src/app/global.component';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/api/expenses`;

  constructor(private http: HttpClient) { }

  /**
   * Sube una imagen de comprobante al servidor y crea un registro de gasto temporal
   * @param file Archivo de imagen del comprobante
   * @param userId ID del usuario
   * @param companyId ID de la empresa
   * @returns Observable con la respuesta del servidor
   */
  uploadReceipt(file: File, userId: string, companyId: string): Observable<any> {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('userId', userId);
    formData.append('companyId', companyId);

    return this.http.post(`${this.apiUrl}/ocr`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene el estado actual de un gasto por su ID
   * @param expenseId ID del gasto
   * @returns Observable con la información del gasto
   */
  getExpenseStatus(expenseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${expenseId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Confirma y actualiza los datos de un gasto extraídos por OCR
   * @param expenseId ID del gasto
   * @param confirmationData Datos actualizados del gasto
   * @returns Observable con la respuesta del servidor
   */
  confirmExpense(expenseId: number, confirmationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${expenseId}/confirm`, confirmationData);
  }

  /**
   * Maneja los errores de las llamadas HTTP
   * @param error Error HTTP
   * @returns Observable con el mensaje de error
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, Mensaje: ${error.error.message || 'Error desconocido'}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 