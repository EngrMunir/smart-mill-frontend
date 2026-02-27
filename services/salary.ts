import { SalaryPayment } from "@/types";
import { cookies } from "next/headers";

export const createSalaryPayment = async (employeeId: number, data: {
    paymentDate: string;
    month: string;
    year: number;
    amount: number;
    notes?: string;
  }): Promise<SalaryPayment> => {
    const accessToken = (await cookies()).get("accessToken")!.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/employees/${employeeId}/salary-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create salary payment');
    }

    const result = await response.json();
    return result.data;
  };

  export const getSalaryPayments = async (employeeId: number) => {
    const accessToken = (await cookies()).get("accessToken")!.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/employees/${employeeId}/salary-payments`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch salary payments');
    }

    const result = await response.json();
    return result.data;
  };