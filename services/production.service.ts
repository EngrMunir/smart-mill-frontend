// Production API
export const productionAPI = {
  createBatch: async (data: {
    paddyTypeId: number;
    productionDate: string;
    totalWeight: number;
    totalBosta: number;
    riceOutputs: Array<{
      riceTypeId: number;
      bostaQuantity: number;
      bostaSize: number;
    }>;
    branOutputs: Array<{
      branTypeId: number;
      bostaQuantity: number;
      bostaSize: number;
    }>;
    batchNumber: string;
    notes?: string;
  }): Promise<ProductionBatch> => {
    console.log('=== Creating Production Batch ===');
    console.log('Request Data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/production/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Create Production Batch API Error:', response.status, errorText);
      throw new Error(`Failed to create production batch: ${response.status}`);
    }

    const result = await response.json();
    console.log('Create Production Batch API Response:', result);
    
    // Handle different response formats
    if (result.data) {
    return result.data;
    } else if (result.success && result.success.data) {
      return result.success.data;
    }
    
    return result;
  },

  getAllBatches: async (): Promise<ProductionBatch[]> => {
    const response = await fetch(`${API_BASE_URL}/production/batches`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Production Batches API Error:', response.status, errorText);
      throw new Error(`Failed to fetch production batches: ${response.status}`);
    }

    const result = await response.json();
    console.log('Production Batches API Response:', result);
    
    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && result.success.data && Array.isArray(result.success.data)) {
      return result.success.data;
    }
    
    console.warn('Unexpected Production Batches API response format:', result);
    return [];
  },

  getBatchById: async (id: number): Promise<ProductionBatch> => {
    const response = await fetch(`${API_BASE_URL}/production/batches/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch production batch');
    }

    const result: ApiResponse<ProductionBatch> = await response.json();
    return result.data;
  },
};