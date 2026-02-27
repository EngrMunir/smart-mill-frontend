"use server"
import { Sale } from "@/types";
import { cookies } from "next/headers";

export const createSale = async (data: {
    customerId: number;
    saleDate: string;
    items: Array<{
      productType: 'RICE' | 'BRAN';
      riceTypeId?: number;
      branTypeId?: number;
      bostaQuantity: number;
      bostaSize: number;
      unitPrice: number;
    }>;
    invoiceNumber: string;
    notes?: string;
  }): Promise<Sale> => {
    const accessToken = (await cookies()).get("accessToken")!.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create sale');
    }

    const result = await response.json();
    return result.data;
  };

  export const getAllSales = async (): Promise<Sale[]> => {
    const accessToken = (await cookies()).get("accessToken")!.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sales`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales');
    }

    const result = await response.json();
    return result.data;
  };

  export const getSaleById = async (id: number): Promise<Sale> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sales/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sale');
    }

    const result = await response.json();
    return result.data;
  };