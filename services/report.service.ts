
// Reports API
export const reportsAPI = {
  getSalesReport: async (params: {
    startDate: string;
    endDate: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/reports/sales?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales report');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  },

  getPurchaseReport: async (params: {
    startDate: string;
    endDate: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/reports/purchases?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase report');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  },

  getProductionReport: async (params: {
    startDate: string;
    endDate: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/reports/production?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch production report');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  },

  getExpenseReport: async (params: {
    startDate: string;
    endDate: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/reports/expenses?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expense report');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  },
};
