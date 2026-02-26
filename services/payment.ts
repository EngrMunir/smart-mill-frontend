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