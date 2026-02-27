import { ExternalPurchase, PaddyPurchase } from "@/types";
import { cookies } from "next/headers";

const accessToken = (await cookies()).get("accessToken")!.value;

  export const createPurchase = async (data: {
    productType: 'RICE' | 'BRAN';
    riceTypeId?: number;
    branTypeId?: number;
    supplierName: string;
    purchaseDate: string;
    bostaQuantity: number;
    bostaSize: number;
    pricePerBosta: number;
    notes?: string;
  }): Promise<ExternalPurchase> => {
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/external-purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result.data;
  };

  export const getAllPurchase = async (): Promise<ExternalPurchase[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/external-purchases`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch external purchases: ${response.status}`);
    }
    const result = await response.json();

    return result;
  };

  export const getPurchaseById = async (id: number): Promise<ExternalPurchase> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/external-purchases/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch external purchase');
    }

    const result = await response.json();
    return result.data;
  };

 export const createPaddyPurchase = async (data: {
    farmerId: number;
    paddyTypeId: number;
    purchaseDate: string;
    totalBosta: number;
    totalWeight: number;
    pricePerKg: number;
    totalPrice: number;
    paidAmount?: number;
    notes?: string;
  }): Promise<PaddyPurchase> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {      
      throw new Error("Failed to create paddy purchase");
    }
    const result = await response.json();
    return result.data;
  };

  export const getAllPaddyPurchases = async (): Promise<PaddyPurchase[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/purchases`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch paddy purchases: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  };

  export const getPaddyPurchaseById = async (id: number): Promise<PaddyPurchase> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/purchases/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch paddy purchase');
    }

    const result = await response.json();
    return result.data;
  };