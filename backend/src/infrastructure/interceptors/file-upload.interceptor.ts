import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private fileInterceptor: NestInterceptor;

  constructor(private fieldName: string) {
    this.fileInterceptor = new (FileInterceptor(fieldName, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB límite
      },
    }))();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap((data) => {
        return this.fileInterceptor.intercept(context, next);
      })
    );
  }
} 