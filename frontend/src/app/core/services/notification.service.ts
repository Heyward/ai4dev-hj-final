import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  /**
   * Muestra una notificación tipo toast
   * @param type Tipo de notificación (success, error, warning, info)
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000ms)
   */
  showToast(type: NotificationType, message: string, duration: number = 3000): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  }

  /**
   * Muestra una alerta modal
   * @param title Título de la alerta
   * @param message Mensaje de la alerta
   * @param type Tipo de alerta (success, error, warning, info)
   */
  showAlert(title: string, message: string, type: NotificationType): void {
    Swal.fire({
      title: title,
      text: message,
      icon: type,
      confirmButtonText: 'OK',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-primary px-4'
      }
    });
  }

  /**
   * Muestra una alerta de confirmación
   * @param title Título de la alerta
   * @param message Mensaje de la alerta
   * @param confirmText Texto del botón de confirmación
   * @param cancelText Texto del botón de cancelación
   * @returns Promise que se resuelve con true si el usuario confirma, false si cancela
   */
  showConfirmation(title: string, message: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<boolean> {
    return new Promise((resolve) => {
      Swal.fire({
        title: title,
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'btn btn-primary px-4',
          cancelButton: 'btn btn-danger ms-2 px-4'
        }
      }).then((result) => {
        resolve(result.isConfirmed);
      });
    });
  }

  /**
   * Muestra una notificación de éxito
   * @param message Mensaje a mostrar
   */
  success(message: string): void {
    this.showToast(NotificationType.SUCCESS, message);
  }

  /**
   * Muestra una notificación de error
   * @param message Mensaje a mostrar
   */
  error(message: string): void {
    this.showToast(NotificationType.ERROR, message);
  }

  /**
   * Muestra una notificación de advertencia
   * @param message Mensaje a mostrar
   */
  warning(message: string): void {
    this.showToast(NotificationType.WARNING, message);
  }

  /**
   * Muestra una notificación informativa
   * @param message Mensaje a mostrar
   */
  info(message: string): void {
    this.showToast(NotificationType.INFO, message);
  }
} 