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