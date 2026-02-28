'use server'
import { Farmer } from "@/types";
import { cookies } from "next/headers";

  export const createFarmer = async (data: {
    name: string;
    phone: string;
    address: string;
    isActive?: boolean;
  }): Promise<Farmer> => {
     const accessToken = (await cookies()).get("accessToken")!.value;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/farmers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create farmer');
      }

      const result = await response.json();
      return result?.data;
    } catch (error) {
      throw error;
    }
  };

  export const getAllFarmer = async (): Promise<Farmer[]> => {
     const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/farmers`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farmers`);
    }

    const result = await response.json();
    
    return result;
  };

  export const getFarmerById = async (id: number): Promise<Farmer> => {
     const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/farmers/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch farmer');
    }

    const result = await response.json();
    return result?.data;
  };

  export const updateFarmer = async (id: number, data: Partial<Farmer>): Promise<Farmer> => {
     const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/farmers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update farmer');
    }

    const result = await response.json();
    return result?.data;
  };

  export const deleteFarmer = async (id: number): Promise<void> => {
     const accessToken = (await cookies()).get("accessToken")!.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/farmers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete farmer');
    }
  };