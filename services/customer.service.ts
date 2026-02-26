/* eslint-disable @typescript-eslint/no-explicit-any */
import { Customer } from "@/types";
import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";

 export const createCustomer = async (data: FieldValues) => {
    const accessToken = (await cookies()).get("accessToken")!.value;
   try {
     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    const result = await response.json();
    return result.data;
   } catch (error:any) {
    throw new Error(error?.message || "Something went wrong");
   }
  };

  export const getAllCustomer = async () => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customers`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    const result = await response.json();
    return result;
  };

  export const getCustomerById = async (id: number) => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    const result = await response.json();
    return result?.data;
  };

  export const updateCustomer = async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update customer');
    }

    const result = await response.json();
    return result?.data;
  };

  export const deleteCustomer = async (id: number) => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  };