export interface Farmer {
  id: number;
  name: string;
  phone: string;
  address: string;
  totalPurchased: number;
  totalDue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}