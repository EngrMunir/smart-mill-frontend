import { Farmer } from "./farmer";
import { PaddyTypeResponse } from "./paddyType";

export interface PaddyPurchase {
  id: number;
  farmerId: number;
  paddyTypeId: number;
  purchaseDate: string;
  totalKg: number;
  totalBosta: number;
  pricePerKg: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  bostas: Array<{
    bostaNumber: number;
    weight: number;
  }>;
  notes?: string;
  farmer?: Farmer;
  paddyType?: PaddyTypeResponse;
  createdAt: string;
  updatedAt: string;
}