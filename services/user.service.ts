export const usersAPI = {
  create: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    millId: number;
    isActive?: boolean;
  }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const result: ApiResponse<User> = await response.json();
    return result.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Users API Error:', response.status, errorText);
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const result = await response.json();
    console.log('Users API Response:', result);
    
    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error('Unexpected users response format:', result);
      return [];
    }
  },

  getById: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const result: ApiResponse<User> = await response.json();
    return result.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Users Profile API Error:', response.status, errorText);
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const result = await response.json();
    console.log('Users Profile API Response:', result);
    
    // Handle both wrapped response {success, data} and direct object
    if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && result.data && typeof result.data === 'object') {
      return result.data;
    } else if (result.id) {
      // Direct user object
      return result;
    } else {
      console.error('Unexpected profile response format:', result);
      throw new Error('Invalid profile response format');
    }
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const result: ApiResponse<User> = await response.json();
    return result.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },
};