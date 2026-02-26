export interface DashboardSummary {
  totalPaddyPurchased: number;
  totalRiceProduced: number;
  totalBranProduced: number;
  totalSales: number;
  totalDue: number;
  monthlySales: Array<{
    month: string;
    year: number;
    amount: number;
  }>;
}