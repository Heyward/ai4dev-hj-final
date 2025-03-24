import { Injectable, Logger } from '@nestjs/common';
import { IReceiptProcessor, ReceiptData } from '../../domain/expense/interfaces/receipt-processor.interface';
import { 
  TextractClient, 
  AnalyzeExpenseCommand, 
  AnalyzeExpenseCommandInput 
} from '@aws-sdk/client-textract';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsTextractService implements IReceiptProcessor {
  private readonly logger = new Logger(AwsTextractService.name);
  private readonly textractClient: TextractClient;

  constructor(private readonly configService: ConfigService) {
    // Inicializar el cliente de Textract con las credenciales de AWS
    this.textractClient = new TextractClient({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async processReceipt(receiptPath: string): Promise<ReceiptData> {
    try {
      this.logger.log(`Processing receipt from path: ${receiptPath}`);
      
      // Validate file format first
      this.validateFileFormat(receiptPath);
      
      let document;
      
      try {
        if (receiptPath.includes('amazonaws.com')) {
          // Es una URL de S3, extraer el bucket y la clave
          const url = new URL(receiptPath);
          const pathParts = url.pathname.split('/');
          const key = pathParts.slice(1).join('/'); // Eliminar el slash inicial
          const bucketName = url.hostname.split('.')[0]; // El bucket es la primera parte del hostname
          
          this.logger.debug(`Extracted S3 details - Bucket: ${bucketName}, Key: ${key}`);
          
          document = {
            S3Object: {
              Bucket: bucketName,
              Name: decodeURIComponent(key), // Decode URL-encoded characters
            },
          };
        } else if (receiptPath.startsWith('s3://')) {
          document = this.getS3Document(receiptPath);
        } else {
          document = await this.getLocalDocument(receiptPath);
        }
      } catch (error) {
        this.logger.error(`Error preparing document for Textract: ${error.message}`, {
          receiptPath,
          error: error.stack,
        });
        throw new Error(`Failed to prepare document for processing: ${error.message}`);
      }
      
      // Log the document configuration before sending to Textract
      this.logger.debug('Textract document configuration:', document);
      
      // Configurar los parámetros para la API de Textract
      const params: AnalyzeExpenseCommandInput = {
        Document: document,
      };

      // Llamar a la API de Textract
      const command = new AnalyzeExpenseCommand(params);
      
      try {
        const response = await this.textractClient.send(command);
        return this.extractDataFromResponse(response);
      } catch (error) {
        // Add specific error handling for common AWS errors
        if (error.name === 'AccessDeniedException') {
          this.logger.error('AWS access denied. Please check AWS credentials and permissions.');
          throw new Error('AWS access denied. Please check credentials and permissions.');
        } else if (error.name === 'InvalidS3ObjectException') {
          this.logger.error('S3 object not found or not accessible', {
            document,
            error: error.message,
          });
          throw new Error('Receipt file not found or not accessible in S3');
        } else if (error.name === 'UnsupportedDocumentException') {
          this.logger.error('Unsupported document format', {
            document,
            error: error.message,
          });
          throw new Error('The receipt file format is not supported. Please upload a PNG or JPEG image.');
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(`Error processing receipt with Textract: ${error.message}`, {
        receiptPath,
        error: error.stack,
        awsRegion: this.configService.get<string>('AWS_REGION'),
      });
      throw new Error(`Failed to process receipt: ${error.message}`);
    }
  }

  private getS3Document(s3Path: string) {
    try {
      // Formato esperado: s3://bucket-name/object-key
      const s3Uri = new URL(s3Path);
      const bucket = s3Uri.hostname;
      const name = decodeURIComponent(s3Uri.pathname.substring(1)); // Decode URL-encoded characters
      
      this.logger.debug(`Parsed S3 path - Bucket: ${bucket}, Key: ${name}`);
      
      return {
        S3Object: {
          Bucket: bucket,
          Name: name,
        },
      };
    } catch (error) {
      this.logger.error(`Error parsing S3 path: ${error.message}`, {
        s3Path,
        error: error.stack,
      });
      throw new Error(`Invalid S3 path format: ${error.message}`);
    }
  }

  private async getLocalDocument(filePath: string): Promise<{ Bytes: Uint8Array }> {
    try {
      // En un entorno real, aquí leeríamos el archivo del sistema de archivos
      // Para este ejemplo, simulamos la lectura del archivo
      const fs = await import('fs/promises');
      const fileBuffer = await fs.readFile(filePath);
      
      return {
        Bytes: new Uint8Array(fileBuffer),
      };
    } catch (error) {
      this.logger.error(`Error reading local file: ${error.message}`, error.stack);
      throw new Error(`Failed to read local file: ${error.message}`);
    }
  }

  private extractDataFromResponse(response: any): ReceiptData {
    try {
      const result: ReceiptData = {
        amount: undefined,
        provider: undefined,
        providerId: undefined,
        concept: undefined,
        date: undefined,
        additionalData: {
          raw: response,
          extractedFields: [],
          lineItems: []
        }
      };

      // Verificar si hay documentos de gastos en la respuesta
      if (!response.ExpenseDocuments || response.ExpenseDocuments.length === 0) {
        this.logger.warn('No expense documents found in the Textract response');
        return result;
      }

      // Obtener el primer documento de gastos
      const expenseDocument = response.ExpenseDocuments[0];
      
      // Procesar los campos del documento
      if (expenseDocument.SummaryFields) {
        for (const field of expenseDocument.SummaryFields) {
          if (!field.Type || !field.ValueDetection) continue;

          const fieldType = field.Type.Text?.toLowerCase();
          const fieldValue = field.ValueDetection.Text;

          // Store all extracted fields in additionalData
          result.additionalData.extractedFields.push({
            type: fieldType,
            value: fieldValue,
            confidence: field.ValueDetection.Confidence
          });

          switch (fieldType) {
            case 'total':
              result.amount = this.parseAmount(fieldValue);
              break;
            case 'vendor_name':
              result.provider = fieldValue;
              break;
            case 'vendor_tax_id':
            case 'supplier_id':
            case 'tax_payer_id':
              result.providerId = fieldValue;
              break;
            case 'invoice_receipt_date':
              result.date = this.parseDate(fieldValue);
              break;
            case 'invoice_receipt_id':
              // Podemos usar el ID del recibo como parte del concepto
              result.concept = `Receipt ID: ${fieldValue}`;
              break;
          }
        }
      }

      // Process line items and store them in additionalData
      if (expenseDocument.LineItemGroups) {
        for (const group of expenseDocument.LineItemGroups) {
          if (group.LineItems) {
            for (const item of group.LineItems) {
              if (item.LineItemExpenseFields) {
                const lineItem: any = {};
                
                for (const field of item.LineItemExpenseFields) {
                  if (field.Type?.Text && field.ValueDetection?.Text) {
                    lineItem[field.Type.Text.toLowerCase()] = {
                      value: field.ValueDetection.Text,
                      confidence: field.ValueDetection.Confidence
                    };
                  }
                }
                
                result.additionalData.lineItems.push(lineItem);
              }
            }
          }
        }
      }

      // Procesar los elementos de línea para extraer más información si es necesario
      if (expenseDocument.LineItemGroups) {
        let items = [];
        for (const group of expenseDocument.LineItemGroups) {
          if (group.LineItems) {
            for (const item of group.LineItems) {
              if (item.LineItemExpenseFields) {
                const itemDesc = item.LineItemExpenseFields
                  .filter((field: any) => field.Type?.Text?.toLowerCase() === 'item')
                  .map((field: any) => field.ValueDetection?.Text)
                  .filter(Boolean)
                  .join(', ');
                
                if (itemDesc) {
                  items.push(itemDesc);
                }
              }
            }
          }
        }
        
        // Si tenemos elementos de línea y no tenemos un concepto, usamos los elementos como concepto
        if (items.length > 0 && !result.concept) {
          result.concept = `Items: ${items.join('; ')}`;
        }
      }

      // Si aún no tenemos un concepto, usamos un valor predeterminado
      if (!result.concept) {
        result.concept = 'Expense from receipt';
      }

      this.logger.log('Successfully extracted data from receipt', result);
      return result;
    } catch (error) {
      this.logger.error(`Error extracting data from Textract response: ${error.message}`, error.stack);
      throw new Error(`Failed to extract data from Textract response: ${error.message}`);
    }
  }

  private parseAmount(amountStr: string): number | undefined {
    try {
      // Remove currency symbols and any non-numeric characters except dots and commas
      const cleanedAmount = amountStr.replace(/[^\d.,]/g, '');
      
      // Handle different number formats:
      // 1. Numbers with comma as thousand separator (30,000 -> 30000)
      // 2. Numbers with dot as thousand separator (30.000 -> 30000)
      // 3. Numbers with comma as decimal separator (30,50 -> 30.50)
      // 4. Regular decimal numbers (30.50 -> 30.50)
      
      let normalizedAmount: string;
      
      if (cleanedAmount.includes(',') && cleanedAmount.includes('.')) {
        // If both separators exist, comma is likely thousand separator
        normalizedAmount = cleanedAmount.replace(/,/g, '');
      } else if (cleanedAmount.includes(',')) {
        // If only comma exists, check its position from right
        const parts = cleanedAmount.split(',');
        if (parts[1]?.length === 3) {
          // Comma is likely a thousand separator (30,000 -> 30000)
          normalizedAmount = cleanedAmount.replace(/,/g, '');
        } else {
          // Comma is likely a decimal separator (30,50 -> 30.50)
          normalizedAmount = cleanedAmount.replace(',', '.');
        }
      } else if (cleanedAmount.includes('.')) {
        // If only dot exists, check its position from right
        const parts = cleanedAmount.split('.');
        if (parts[1]?.length === 3) {
          // Dot is likely a thousand separator (30.000 -> 30000)
          normalizedAmount = cleanedAmount.replace(/\./g, '');
        } else {
          // Dot is likely a decimal separator (30.50 -> 30.50)
          normalizedAmount = cleanedAmount;
        }
      } else {
        normalizedAmount = cleanedAmount;
      }
      
      // Convert to number
      const amount = parseFloat(normalizedAmount);
      
      this.logger.debug(`Amount parsing: Original=${amountStr}, Cleaned=${cleanedAmount}, Normalized=${normalizedAmount}, Final=${amount}`);
      
      return isNaN(amount) ? undefined : amount;
    } catch (error) {
      this.logger.warn(`Could not parse amount: ${amountStr}`, error);
      return undefined;
    }
  }

  private parseDate(dateStr: string): Date | undefined {
    try {
      // Intentar analizar la fecha
      const date = new Date(dateStr);
      
      // Verificar si la fecha es válida
      return isNaN(date.getTime()) ? undefined : date;
    } catch (error) {
      this.logger.warn(`Could not parse date: ${dateStr}`);
      return undefined;
    }
  }

  private validateFileFormat(filePath: string): void {
    const supportedFormats = ['.png', '.jpg', '.jpeg', '.pdf', '.tiff'];
    const fileExtension = filePath.toLowerCase().split('.').pop();
    
    if (!fileExtension || !supportedFormats.includes(`.${fileExtension}`)) {
      this.logger.error('Unsupported file format', {
        filePath,
        extension: fileExtension,
        supportedFormats,
      });
      throw new Error(
        'Unsupported file format. Please upload one of the following formats: ' +
        supportedFormats.join(', ')
      );
    }

    // Additional PDF validation since Textract has specific requirements for PDFs
    if (fileExtension === 'pdf') {
      this.logger.warn(
        'PDF files must be scanned documents. Native PDFs are not supported by AWS Textract. ' +
        'For best results, please upload PNG or JPEG images.'
      );
    }
  }
} 