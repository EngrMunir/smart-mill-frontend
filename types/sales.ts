import { Customer } from "./customer";

export interface Sale {
  id: number;
  customerId: number;
  saleDate: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  items: Array<{
    id: number;
    productType: 'RICE' | 'BRAN';
    riceTypeId?: number;
    branTypeId?: number;
    bostaQuantity: number;
    bostaSize: number;
    unitPrice: number;
  }>;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}