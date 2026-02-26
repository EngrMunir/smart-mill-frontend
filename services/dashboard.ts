import { cookies } from "next/headers";

export const getDashboardSummary = async () => {
    const accessToken = (await cookies()).get("accessToken")!.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard summary');
    }
    const result = await response.json();
    return result?.data;
  };
