import { User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('API URL:', `${API_BASE_URL}/auth/login`);
    
    const requestBody = { email: email.trim(), password };
    console.log('Request body (without password):', { email: requestBody.email, passwordLength: requestBody.password.length });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('=== RESPONSE RECEIVED ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = 'Login failed';
      let errorData: any = null;
      
      try {
        // Try to get response as JSON first
        const contentType = response.headers.get('content-type');
        console.log('Response Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          console.error('=== ERROR RESPONSE (JSON) ===');
          console.error('Full error object:', JSON.stringify(errorData, null, 2));
          console.error('Error keys:', Object.keys(errorData));
          console.error('Error message field:', errorData.message);
          console.error('Error error field:', errorData.error);
          errorMessage = errorData.message || errorData.error || `Login failed: ${response.status}`;
        } else {
          // Try as text
          const errorText = await response.text();
          console.error('=== ERROR RESPONSE (TEXT) ===');
          console.error('Error text:', errorText);
          errorMessage = errorText || `Login failed: ${response.status} ${response.statusText}`;
        }
      } catch (e) {
        console.error('=== ERROR PARSING RESPONSE ===');
        console.error('Parse error:', e);
        const errorText = await response.text().catch(() => '');
        console.error('Error text (fallback):', errorText);
        errorMessage = errorText || `Login failed: ${response.status} ${response.statusText}`;
      }
      
      // Provide specific error messages based on status code
      // But preserve backend message if available
      if (response.status === 401) {
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        }
        console.error('=== 401 UNAUTHORIZED ===');
        console.error('This usually means:');
        console.error('1. Password is incorrect');
        console.error('2. User account is inactive');
        console.error('3. User was found but authentication failed');
        console.error('Backend should check: password hash comparison, isActive flag');
      } else if (response.status === 404) {
        errorMessage = errorData?.message || 'User not found. Please check your email.';
        console.error('=== 404 NOT FOUND ===');
        console.error('User with this email does not exist in database');
      } else if (response.status === 403) {
        errorMessage = errorData?.message || 'Account is inactive. Please contact administrator.';
        console.error('=== 403 FORBIDDEN ===');
        console.error('User account is inactive (isActive = false)');
    }

      console.error('=== FINAL ERROR MESSAGE ===');
      console.error('Will throw:', errorMessage);
      console.error('=== LOGIN ATTEMPT END (FAILED) ===');
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('=== LOGIN SUCCESS ===');
    console.log('Has token:', !!result.access_token);
    console.log('Token length:', result.access_token?.length);
    console.log('User object:', JSON.stringify(result.user, null, 2));
    console.log('=== LOGIN ATTEMPT END (SUCCESS) ===');
    return result;
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    millId?: number;
  }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
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
      console.error('Profile API Error:', response.status, errorText);
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const result = await response.json();
    console.log('Profile API Response:', result);
    
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
};

// Users API
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

// Mills API
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

// Customers API
export const customersAPI = {
  create: async (data: {
    name: string;
    phone: string;
    address: string;
    isActive?: boolean;
  }): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    const result: ApiResponse<Customer> = await response.json();
    return result.data;
  },

  getAll: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Customers API Error:', response.status, errorText);
      throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    const result = await response.json();
    console.log('Customers API Response:', result);

    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
    return result.data;
    } else if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error('Unexpected customers response format:', result);
      return [];
    }
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }

    const result: ApiResponse<Customer> = await response.json();
    return result.data;
  },

  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update customer');
    }

    const result: ApiResponse<Customer> = await response.json();
    return result.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  },
};

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

// External Purchase API
export const externalPurchaseAPI = {
  create: async (data: {
    productType: 'RICE' | 'BRAN';
    riceTypeId?: number;
    branTypeId?: number;
    supplierName: string;
    purchaseDate: string;
    bostaQuantity: number;
    bostaSize: number;
    pricePerBosta: number;
    notes?: string;
  }): Promise<ExternalPurchase> => {
    console.log('=== External Purchase API Request ===');
    console.log('URL:', `${API_BASE_URL}/external-purchases`);
    console.log('Method: POST');
    console.log('Request Data:', JSON.stringify(data, null, 2));
    console.log('Auth Token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');

    const response = await fetch(`${API_BASE_URL}/external-purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    console.log('=== External Purchase API Response ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('OK:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Failed to create external purchase';
      let errorData: any = null;
      
      try {
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          console.error('=== External Purchase Error Response (JSON) ===');
          console.error('Status:', response.status);
          console.error('Error data:', JSON.stringify(errorData, null, 2));
          errorMessage = errorData.message || errorData.error || errorData.error?.message || errorData.msg || `Failed to create external purchase: ${response.status}`;
        } else {
          const errorText = await response.text();
          console.error('=== External Purchase Error Response (Text) ===');
          console.error('Status:', response.status);
          console.error('Error text:', errorText);
          errorMessage = errorText || `Failed to create external purchase: ${response.status} ${response.statusText}`;
        }
      } catch (e) {
        console.error('=== Error Parsing External Purchase Response ===');
        console.error('Parse error:', e);
        try {
          const errorText = await response.text();
          console.error('Error text (fallback):', errorText);
          errorMessage = errorText || `Failed to create external purchase: ${response.status} ${response.statusText}`;
        } catch (textError) {
          console.error('Could not read error text:', textError);
          errorMessage = `Failed to create external purchase: ${response.status} ${response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result: ApiResponse<ExternalPurchase> = await response.json();
    console.log('✅ External Purchase Success Response:', JSON.stringify(result, null, 2));
    return result.data;
  },

  getAll: async (): Promise<ExternalPurchase[]> => {
    const response = await fetch(`${API_BASE_URL}/external-purchases`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('External Purchases API Error:', response.status, errorText);
      throw new Error(`Failed to fetch external purchases: ${response.status}`);
    }

    const result = await response.json();
    console.log('External Purchases API Response:', result);
    
    // Handle both wrapped response {success, data} and direct array
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else if (result.success && result.success.data && Array.isArray(result.success.data)) {
      return result.success.data;
    }
    
    console.warn('Unexpected External Purchases API response format:', result);
    return [];
  },

  getById: async (id: number): Promise<ExternalPurchase> => {
    const response = await fetch(`${API_BASE_URL}/external-purchases/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch external purchase');
    }

    const result: ApiResponse<ExternalPurchase> = await response.json();
    return result.data;
  },
};

// Employees API
export const employeesAPI = {
  create: async (data: {
    name: string;
    phone: string;
    address: string;
    designation: string;
    salary: number;
    joinDate: string;
    isActive?: boolean;
  }): Promise<Employee> => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create employee');
    }

    const result: ApiResponse<Employee> = await response.json();
    return result.data;
  },

  getAll: async (): Promise<Employee[]> => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const result: ApiResponse<Employee[]> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employee');
    }

    const result: ApiResponse<Employee> = await response.json();
    return result.data;
  },

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
};

// Payments API
export const paymentsAPI = {
  payFarmerDue: async (farmerId: number, amount: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/payments/farmers/${farmerId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to pay farmer due');
    }
  },

  payCustomerDue: async (customerId: number, amount: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/payments/customers/${customerId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to pay customer due');
    }
  },

  payPaddyPurchase: async (purchaseId: number, amount: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/payments/paddy-purchases/${purchaseId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to pay paddy purchase');
    }
  },

  paySale: async (saleId: number, amount: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/payments/sales/${saleId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to pay sale');
    }
  },
};

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

// Stock API
export const stockAPI = {
  getAllStock: async (): Promise<StockSummary> => {
    const response = await fetch(`${API_BASE_URL}/stock`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stock API Error:', response.status, errorText);
      throw new Error(`Failed to fetch stock summary: ${response.status}`);
    }

    const result = await response.json();
    console.log('Stock API Response:', result);

    // Handle both wrapped response {success, data} and direct object
    if (result.paddy && result.rice && result.bran) {
      return result;
    } else if (result.data && result.data.paddy && result.data.rice && result.data.bran) {
    return result.data;
    } else if (result.success && result.data && result.data.paddy && result.data.rice && result.data.bran) {
      return result.data;
    } else {
      console.error('Unexpected stock response format:', result);
      return { paddy: {}, rice: {}, bran: {} };
    }
  },

  getPaddyStock: async (paddyTypeId?: number): Promise<any> => {
    const queryParams = paddyTypeId ? `?paddyTypeId=${paddyTypeId}` : '';
    const response = await fetch(`${API_BASE_URL}/stock/paddy${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Paddy Stock API Error:', response.status, errorText);
      throw new Error(`Failed to fetch paddy stock: ${response.status}`);
    }

    // Get raw response text first
    const responseText = await response.text();
    console.log('/stock/paddy RAW Response (as text):', responseText);
    
    // Parse JSON
    const result = JSON.parse(responseText);
    console.log('/stock/paddy RAW Response (parsed):', result);
    
    // Handle different response formats
    if (result.data) {
    return result.data;
    } else if (result.success && result.success.data) {
      return result.success.data;
    }
    
    return result;
  },

  getRiceStock: async (riceTypeId?: number): Promise<any> => {
    const queryParams = riceTypeId ? `?riceTypeId=${riceTypeId}` : '';
    const response = await fetch(`${API_BASE_URL}/stock/rice${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch rice stock: ${response.status}`);
    }

    // Get raw response text first (similar to paddy stock)
    const responseText = await response.text();
    console.log('=== Backend থেকে Rice Stock API Response ===');
    console.log('URL:', `${API_BASE_URL}/stock/rice${queryParams}`);
    console.log('Raw Response (Text):', responseText);
    
    // Parse JSON
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('Parsed Response (JSON):', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Invalid JSON response from rice stock API');
    }
    
    // Handle different response formats
    let finalResult;
    if (result.data) {
      finalResult = result.data;
      console.log('Final Result (from result.data):', JSON.stringify(finalResult, null, 2));
    } else if (result.success && result.success.data) {
      finalResult = result.success.data;
      console.log('Final Result (from result.success.data):', JSON.stringify(finalResult, null, 2));
    } else {
      finalResult = result;
      console.log('Final Result (direct result):', JSON.stringify(finalResult, null, 2));
    }
    
    console.log('=== End of Rice Stock API Response ===');
    
    return finalResult;
  },

  getBranStock: async (branTypeId?: number): Promise<any> => {
    const queryParams = branTypeId ? `?branTypeId=${branTypeId}` : '';
    const response = await fetch(`${API_BASE_URL}/stock/bran${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Bran Stock API Error:', response.status, errorText);
      throw new Error(`Failed to fetch bran stock: ${response.status}`);
    }

    const result = await response.json();
    console.log('Bran Stock API Response:', result);
    
    // Handle different response formats
    if (result.data) {
    return result.data;
    } else if (result.success && result.success.data) {
      return result.success.data;
    }
    
    return result;
  },
};

// Dashboard API
export const dashboardAPI = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard summary');
    }

    const result: ApiResponse<DashboardSummary> = await response.json();
    return result.data;
  },
};

