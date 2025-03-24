import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IFileStorageService, FileUploadResult } from '../../domain/shared/interfaces/file-storage.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AwsS3Service implements IFileStorageService {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
    }

    
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async uploadFile(file: Buffer | string, fileName: string, mimeType = 'application/octet-stream'): Promise<FileUploadResult> {
    try {
      this.logger.log(`Uploading file ${fileName} to S3 bucket ${this.bucketName}`);
      
      // Generar una clave única para el archivo
      const key = `receipts/${Date.now()}-${fileName}`;
      
      // Preparar el contenido del archivo
      let fileContent: Buffer;
      
      if (typeof file === 'string') {
        // Si es una ruta de archivo, leer el archivo
        if (fs.existsSync(file)) {
          fileContent = fs.readFileSync(file);
        } else {
          throw new Error(`File not found: ${file}`);
        }
      } else {
        // Si ya es un Buffer, usarlo directamente
        fileContent = file;
      }
      
      // Configurar el comando para subir el archivo
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: mimeType,
      });
      
      // Ejecutar el comando
      await this.s3Client.send(command);
      
      // Obtener la URL del archivo
      const url = this.getFileUrl(key);
      
      this.logger.log(`File uploaded successfully to ${url}`);
      
      return {
        url,
        key,
      };
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file to S3: ${error.message}`); 
    }
  }

  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting file ${key} from S3 bucket ${this.bucketName}`);
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      await this.s3Client.send(command);
      
      this.logger.log(`File deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3: ${error.message}`, error.stack);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Error generating signed URL: ${error.message}`, error.stack);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }
} 