// Sales API
export const salesAPI = {
  create: async (data: {
    customerId: number;
    saleDate: string;
    items: Array<{
      productType: 'RICE' | 'BRAN';
      riceTypeId?: number;
      branTypeId?: number;
      bostaQuantity: number;
      bostaSize: number;
      unitPrice: number;
    }>;
    invoiceNumber: string;
    notes?: string;
  }): Promise<Sale> => {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create sale');
    }

    const result: ApiResponse<Sale> = await response.json();
    return result.data;
  },

  getAll: async (): Promise<Sale[]> => {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales');
    }

    const result: ApiResponse<Sale[]> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<Sale> => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sale');
    }

    const result: ApiResponse<Sale> = await response.json();
    return result.data;
  },
};