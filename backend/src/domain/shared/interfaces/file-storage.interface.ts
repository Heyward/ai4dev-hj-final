export interface FileUploadResult {
  url: string;
  key: string;
}

export interface IFileStorageService {
  uploadFile(file: Buffer | string, fileName: string, mimeType?: string): Promise<FileUploadResult>;
  getFileUrl(key: string): string;
  deleteFile(key: string): Promise<void>;
} 