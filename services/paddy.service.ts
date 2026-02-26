// Paddy API
export const paddyAPI = {
  // Paddy Types
  createPaddyType: async (data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<PaddyTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create paddy type');
    }

    const result: ApiResponse<PaddyTypeResponse> = await response.json();
    return result.data;
  },

  getAllPaddyTypes: async (): Promise<PaddyTypeResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/paddy/types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Paddy Types API Error:', response.status, errorText);
      throw new Error(`Failed to fetch paddy types: ${response.status}`);
    }

    const result = await response.json();
    console.log('Paddy Types API Response:', result);

    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error('Unexpected paddy types response format:', result);
      return [];
    }
  },

  getPaddyTypeById: async (id: number): Promise<PaddyTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/types/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch paddy type');
    }

    const result: ApiResponse<PaddyTypeResponse> = await response.json();
    return result.data;
  },

  updatePaddyType: async (id: number, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<PaddyTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update paddy type');
    }

    const result: ApiResponse<PaddyTypeResponse> = await response.json();
    return result.data;
  },

  deletePaddyType: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/paddy/types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete paddy type');
    }
  },

  // Paddy Purchases
  createPaddyPurchase: async (data: {
    farmerId: number;
    paddyTypeId: number;
    purchaseDate: string;
    totalBosta: number;
    totalWeight: number;
    pricePerKg: number;
    totalPrice: number;
    paidAmount?: number;
    notes?: string;
  }): Promise<PaddyPurchase> => {
    const response = await fetch(`${API_BASE_URL}/paddy/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create paddy purchase';
      let errorData: any = null;
      
      try {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          console.error('=== Paddy Purchase Error Response ===');
          console.error('Status:', response.status);
          console.error('Error data:', JSON.stringify(errorData, null, 2));
          errorMessage = errorData.message || errorData.error || errorData.error?.message || `Failed to create paddy purchase: ${response.status}`;
        } else {
          const errorText = await response.text();
          console.error('=== Paddy Purchase Error Response (Text) ===');
          console.error('Status:', response.status);
          console.error('Error text:', errorText);
          errorMessage = errorText || `Failed to create paddy purchase: ${response.status} ${response.statusText}`;
        }
      } catch (e) {
        console.error('=== Error Parsing Paddy Purchase Response ===');
        console.error('Parse error:', e);
        const errorText = await response.text().catch(() => '');
        console.error('Error text (fallback):', errorText);
        errorMessage = errorText || `Failed to create paddy purchase: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result: ApiResponse<PaddyPurchase> = await response.json();
    return result.data;
  },

  getAllPaddyPurchases: async (): Promise<PaddyPurchase[]> => {
    const response = await fetch(`${API_BASE_URL}/paddy/purchases`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Paddy Purchases API Error:', response.status, errorText);
      throw new Error(`Failed to fetch paddy purchases: ${response.status}`);
    }

    const result = await response.json();
    console.log('Paddy Purchases API Response:', result);
    
    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && result.success.data && Array.isArray(result.success.data)) {
      return result.success.data;
    }
    
    console.warn('Unexpected Paddy Purchases API response format:', result);
    return [];
  },

  getPaddyPurchaseById: async (id: number): Promise<PaddyPurchase> => {
    const response = await fetch(`${API_BASE_URL}/paddy/purchases/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch paddy purchase');
    }

    const result: ApiResponse<PaddyPurchase> = await response.json();
    return result.data;
  },

  // Rice Types
  createRiceType: async (data: {
    name: string;
    defaultBostaSize: number;
    description?: string;
    isActive?: boolean;
  }): Promise<RiceTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/rice-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create rice type');
    }

    const result: ApiResponse<RiceTypeResponse> = await response.json();
    return result.data;
  },

  getAllRiceTypes: async (): Promise<RiceTypeResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/paddy/rice-types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rice Types API Error:', response.status, errorText);
      throw new Error(`Failed to fetch rice types: ${response.status}`);
    }

    const result = await response.json();
    console.log('Rice Types API Response:', result);

    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error('Unexpected rice types response format:', result);
      return [];
    }
  },

  getRiceTypeById: async (id: number): Promise<RiceTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/rice-types/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rice type');
    }

    const result: ApiResponse<RiceTypeResponse> = await response.json();
    return result.data;
  },

  updateRiceType: async (id: number, data: {
    name?: string;
    defaultBostaSize?: number;
    description?: string;
    isActive?: boolean;
  }): Promise<RiceTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/rice-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update rice type');
    }

    const result: ApiResponse<RiceTypeResponse> = await response.json();
    return result.data;
  },

  deleteRiceType: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/paddy/rice-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete rice type');
    }
  },

  // Bran Types
  createBranType: async (data: {
    name: string;
    defaultBostaSize: number;
    description?: string;
    isActive?: boolean;
  }): Promise<BranTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/bran-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create bran type');
    }

    const result: ApiResponse<BranTypeResponse> = await response.json();
    return result.data;
  },

  getAllBranTypes: async (): Promise<BranTypeResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/paddy/bran-types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bran Types API Error:', response.status, errorText);
      throw new Error(`Failed to fetch bran types: ${response.status}`);
    }

    const result = await response.json();
    console.log('Bran Types API Response:', result);

    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error('Unexpected bran types response format:', result);
      return [];
    }
  },

  getBranTypeById: async (id: number): Promise<BranTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/bran-types/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bran type');
    }

    const result: ApiResponse<BranTypeResponse> = await response.json();
    return result.data;
  },

  updateBranType: async (id: number, data: {
    name?: string;
    defaultBostaSize?: number;
    description?: string;
    isActive?: boolean;
  }): Promise<BranTypeResponse> => {
    const response = await fetch(`${API_BASE_URL}/paddy/bran-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update bran type');
    }

    const result: ApiResponse<BranTypeResponse> = await response.json();
    return result.data;
  },

  deleteBranType: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/paddy/bran-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete bran type');
    }
  },
};