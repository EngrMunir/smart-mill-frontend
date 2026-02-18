// Helper function to handle API responses and 401 errors
export async function handleApiResponse<T>(response: Response): Promise<T> {
  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    // Clear token and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    throw new Error('Authentication failed. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `Request failed with status ${response.status}` 
    }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data || result;
}

