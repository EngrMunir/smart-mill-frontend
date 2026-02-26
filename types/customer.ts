export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  totalSales: number;
  totalDue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}