  // Salary Payments
  createSalaryPayment: async (employeeId: number, data: {
    paymentDate: string;
    month: string;
    year: number;
    amount: number;
    notes?: string;
  }): Promise<SalaryPayment> => {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/salary-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create salary payment');
    }

    const result: ApiResponse<SalaryPayment> = await response.json();
    return result.data;
  },

  getSalaryPayments: async (employeeId: number): Promise<SalaryPayment[]> => {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/salary-payments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch salary payments');
    }

    const result: ApiResponse<SalaryPayment[]> = await response.json();
    return result.data;
  },