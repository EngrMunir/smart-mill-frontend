// Farmers API
export const farmersAPI = {
  create: async (data: {
    name: string;
    phone: string;
    address: string;
    isActive?: boolean;
  }): Promise<Farmer> => {
    try {
      const response = await fetch(`${API_BASE_URL}/farmers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Create Farmer API Error:', response.status, response.statusText);
        throw new Error('Failed to create farmer');
      }

      const result: ApiResponse<Farmer> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Create Farmer Network Error:', error);
      throw error;
    }
  },

  getAll: async (): Promise<Farmer[]> => {
    const response = await fetch(`${API_BASE_URL}/farmers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Farmers API Error:', response.status, errorText);
      throw new Error(`Failed to fetch farmers: ${response.status}`);
    }

    const result = await response.json();
    console.log('Farmers API Response:', result);
    
    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && result.success.data && Array.isArray(result.success.data)) {
      return result.success.data;
    }
    
    console.warn('Unexpected Farmers API response format:', result);
    return [];
  },

  getById: async (id: number): Promise<Farmer> => {
    const response = await fetch(`${API_BASE_URL}/farmers/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch farmer');
    }

    const result: ApiResponse<Farmer> = await response.json();
    return result.data;
  },

  update: async (id: number, data: Partial<Farmer>): Promise<Farmer> => {
    const response = await fetch(`${API_BASE_URL}/farmers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update farmer');
    }

    const result: ApiResponse<Farmer> = await response.json();
    return result.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farmers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete farmer');
    }
  },
};