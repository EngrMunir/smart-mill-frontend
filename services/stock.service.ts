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