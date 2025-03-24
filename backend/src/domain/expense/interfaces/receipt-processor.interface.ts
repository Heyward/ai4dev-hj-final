export interface ReceiptData {
  amount: number | undefined;
  provider: string | undefined;
  providerId: string | undefined;
  concept: string | undefined;
  date: Date | undefined;
  additionalData: {
    raw: any;                   // Raw response from Textract
    extractedFields: {          // All fields extracted from the document
      type: string;
      value: string;
      confidence: number;
    }[];
    lineItems: any[];           // Detailed line items from the receipt
  };
}

export interface IReceiptProcessor {
  processReceipt(receiptPath: string): Promise<ReceiptData>;
} 