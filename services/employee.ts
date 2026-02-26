import { Employee } from "@/types";
import { cookies } from "next/headers";

  export const createEmployee = async (data: {
    name: string;
    phone: string;
    address: string;
    designation: string;
    salary: number;
    joinDate: string;
    isActive?: boolean;
  }): Promise<Employee> => {
     const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create employee');
    }

    const result = await response.json();
    return result?.data;
  };

  export const getAllEmployee = async (): Promise<Employee[]> => {
     const accessToken = (await cookies()).get("accessToken")!.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const result = await response.json();
    return result?.data;
  };

  export const getEmployeeById = async (id: number): Promise<Employee> => {
   const accessToken = (await cookies()).get("accessToken")!.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/employees/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employee');
    }

    const result = await response.json();
    return result?.data;
  };