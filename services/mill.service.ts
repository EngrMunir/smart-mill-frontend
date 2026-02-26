export const millsAPI = {
  create: async (data: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    isActive?: boolean;
  }): Promise<Mill> => {
    const response = await fetch(`${API_BASE_URL}/mills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create mill');
    }

    const result: ApiResponse<Mill> = await response.json();
    return result.data;
  },

  getAll: async (): Promise<Mill[]> => {
    const response = await fetch(`${API_BASE_URL}/mills`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mills API Error:', response.status, errorText);
      throw new Error(`Failed to fetch mills: ${response.status}`);
    }

    const result = await response.json();
    console.log('Mills API Response:', result);
    
    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error('Unexpected mills response format:', result);
      return [];
    }
  },

  getById: async (id: number): Promise<Mill> => {
    const response = await fetch(`${API_BASE_URL}/mills/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mill');
    }

    const result: ApiResponse<Mill> = await response.json();
    return result.data;
  },

  update: async (id: number, data: Partial<Mill>): Promise<Mill> => {
    const response = await fetch(`${API_BASE_URL}/mills/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update mill');
    }

    const result: ApiResponse<Mill> = await response.json();
    return result.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/mills/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete mill');
    }
  },
};