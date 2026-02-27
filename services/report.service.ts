import { cookies } from "next/headers";

const accessToken = (await cookies()).get("accessToken")!.value;

export const getSalesReport = async (params: {
    startDate: string;
    endDate: string;
  }) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/reports/sales?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales report');
    }

    const result = await response.json();
    return result.data;
  };

  export const getPurchaseReport = async (params: {
    startDate: string;
    endDate: string;
  }) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/reports/purchases?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase report');
    }

    const result = await response.json();
    return result.data;
  };

  export const getProductionReport = async (params: {
    startDate: string;
    endDate: string;
  }) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/reports/production?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch production report');
    }

    const result = await response.json();
    return result.data;
  };

  export const getExpenseReport = async (params: {
    startDate: string;
    endDate: string;
  }) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/reports/expenses?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expense report');
    }

    const result = await response.json();
    return result.data;
  };
