import { ProductionBatch } from "@/types";
import { cookies } from "next/headers";

  export const createBatch = async (data: {
    paddyTypeId: number;
    productionDate: string;
    totalWeight: number;
    totalBosta: number;
    riceOutputs: Array<{
      riceTypeId: number;
      bostaQuantity: number;
      bostaSize: number;
    }>;
    branOutputs: Array<{
      branTypeId: number;
      bostaQuantity: number;
      bostaSize: number;
    }>;
    batchNumber: string;
    notes?: string;
  }): Promise<ProductionBatch> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/production/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create production batch: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  };

  export const getAllBatches = async (): Promise<ProductionBatch[]> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/production/batches`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch production batches: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  };

  export const getBatchById = async (id: number): Promise<ProductionBatch> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/production/batches/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch production batch');
    }

    const result = await response.json();
    return result.data;
  };