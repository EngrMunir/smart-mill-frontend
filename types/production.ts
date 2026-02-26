import { PaddyTypeResponse } from "./paddyType";

export interface ProductionBatch {
  id: number;
  paddyTypeId: number;
  productionDate: string;
  paddyQuantity: number;
  batchNumber: string;
  notes?: string;
  outputs: Array<{
    id: number;
    riceTypeId?: number;
    branTypeId?: number;
    outputType: 'RICE' | 'BRAN';
    bostaQuantity: number;
    bostaSize: number;
  }>;
  paddyType?: PaddyTypeResponse;
  createdAt: string;
  updatedAt: string;
}