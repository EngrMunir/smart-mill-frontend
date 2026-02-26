import { Mill } from "@/types";
import { cookies } from "next/headers";

  export const createMill = async (data: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    isActive?: boolean;
  }): Promise<Mill> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/mills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create mill');
    }

    const result = await response.json();
    return result?.data;
  };

  export const getAllMill = async (): Promise<Mill[]> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/mills`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch mills: ${response.status}`);
    }

    const result = await response.json();
  return result;
  };

  export const getMillById = async (id: number): Promise<Mill> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/mills/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mill');
    }

    const result = await response.json();
    return result?.data;
  };

  export const updateMill = async (id: number, data: Partial<Mill>): Promise<Mill> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/mills/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update mill');
    }

    const result = await response.json();
    return result?.data;
  };

  export const deleteMill = async (id: number): Promise<void> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env._BASE_URL}/mills/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete mill');
    }
  };