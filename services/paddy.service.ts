'use server'
import { BranTypeResponse, PaddyTypeResponse, RiceTypeResponse } from "@/types";
import { cookies } from "next/headers";

  export const createPaddyType = async (data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<PaddyTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create paddy type');
    }

    const result = await response.json();
    return result.data;
  };

  export const getAllPaddyTypes = async (): Promise<PaddyTypeResponse[]> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/types`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch paddy types: ${response.status}`);
    }

    const result = await response.json();
    return result;
  };

  export const getPaddyTypeById = async (id: number): Promise<PaddyTypeResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/types/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch paddy type');
    }

    const result = await response.json();
    return result.data;
  };

  export const updatePaddyType = async (id: number, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<PaddyTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update paddy type');
    }

    const result = await response.json();
    return result.data;
  };

  export const deletePaddyType = async (id: number): Promise<void> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete paddy type');
    }
  };

  export const createRiceType = async (data: {
    name: string;
    defaultBostaSize: number;
    description?: string;
    isActive?: boolean;
  }): Promise<RiceTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/rice-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create rice type');
    }

    const result = await response.json();
    return result.data;
  };

  export const getAllRiceTypes = async (): Promise<RiceTypeResponse[]> => {
      const accessToken = (await cookies()).get("accessToken")!.value;
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/rice-types`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rice Types API Error:', response.status, errorText);
      throw new Error(`Failed to fetch rice types: ${response.status}`);
    }

    const result = await response.json();
   return result;
  };

  export const getRiceTypeById = async (id: number): Promise<RiceTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/rice-types/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rice type');
    }

    const result = await response.json();
    return result.data;
  };

  export const updateRiceType = async (id: number, data: {
    name?: string;
    defaultBostaSize?: number;
    description?: string;
    isActive?: boolean;
  }): Promise<RiceTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/rice-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update rice type');
    }

    const result = await response.json();
    return result.data;
  };

  export const deleteRiceType = async (id: number): Promise<void> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/rice-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete rice type');
    }
  };

  export const createBranType = async (data: {
    name: string;
    defaultBostaSize: number;
    description?: string;
    isActive?: boolean;
  }): Promise<BranTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/bran-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create bran type');
    }

    const result = await response.json();
    return result.data;
  };

  export const getAllBranTypes = async (): Promise<BranTypeResponse[]> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/bran-types`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bran types: ${response.status}`);
    }

    const result = await response.json();
  return result;
  };

  export const getBranTypeById = async (id: number): Promise<BranTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/bran-types/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bran type');
    }

    const result = await response.json();
    return result.data;
  };

  export const updateBranType = async (id: number, data: {
    name?: string;
    defaultBostaSize?: number;
    description?: string;
    isActive?: boolean;
  }): Promise<BranTypeResponse> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/bran-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update bran type');
    }

    const result = await response.json();
    return result.data;
  };

  export const deleteBranType = async (id: number): Promise<void> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/paddy/bran-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete bran type');
    }
  };