export interface ExternalPurchase {
  id: number;
  productType: 'RICE' | 'BRAN';
  riceTypeId?: number;
  branTypeId?: number;
  supplierName: string;
  purchaseDate: string;
  bostaQuantity: number;
  bostaSize: number;
  pricePerKg: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}