"use server"

import { cookies } from "next/headers";

  export const getAllStock = async () => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/stock`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock summary: ${response.status}`);
    }

    const result = await response.json();

   return result;
  };

  export const getPaddyStock = async (paddyTypeId?: number) => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const queryParams = paddyTypeId ? `?paddyTypeId=${paddyTypeId}` : '';
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/stock/paddy${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch paddy stock: ${response.status}`);
    }

  const result = await response.json();
    
    return result;
  };

  export const getRiceStock = async (riceTypeId?: number) => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const queryParams = riceTypeId ? `?riceTypeId=${riceTypeId}` : '';
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/stock/rice${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rice stock: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  };

  export const getBranStock = async (branTypeId?: number) => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const queryParams = branTypeId ? `?branTypeId=${branTypeId}` : '';
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/stock/bran${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bran stock: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  };