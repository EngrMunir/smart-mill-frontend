export interface SalaryPayment {
  id: number;
  employeeId: number;
  paymentDate: string;
  month: string;
  year: number;
  amount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}