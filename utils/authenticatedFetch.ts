import { tokenStorage } from './tokenStorage';

/**
 * Utility for making authenticated API calls
 * Automatically includes the access token in Authorization header
 */

const API_URL = 'http://192.168.3.19:3000';
// const API_URL = "https://retail-app-siqh.onrender.com";
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Make an authenticated API call with automatic token inclusion
 * If access token is expired, it will be refreshed automatically
 */
export const authenticatedFetch = async (
  endpoint: string,
  config: RequestConfig = {}
) => {
  try {
    let accessToken = await tokenStorage.getAccessToken();

    if (!accessToken) {
      throw new Error('No access token found. User must login.');
    }

    // Prepare headers with authorization
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    // Make the request
    let response = await fetch(`${API_URL}${endpoint}`, {
      method: config.method || 'GET',
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    // If token is expired (401), try to refresh and retry
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token found. User must login again.');
      }

      // Attempt to refresh token
      const refreshResponse = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const refreshData = await refreshResponse.json();

      if (refreshData.success && refreshData.data) {
        // Update the access token
        await tokenStorage.updateAccessToken(refreshData.data.accessToken);

        // Update refresh token if new one provided
        if (refreshData.data.refreshToken) {
          const tokens = await tokenStorage.getTokens();
          if (tokens) {
            await tokenStorage.saveTokens({
              ...tokens,
              accessToken: refreshData.data.accessToken,
              refreshToken: refreshData.data.refreshToken,
            });
          }
        }

        // Retry the original request with new token
        accessToken = refreshData.data.accessToken;
        headers.Authorization = `Bearer ${accessToken}`;

        response = await fetch(`${API_URL}${endpoint}`, {
          method: config.method || 'GET',
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
        });
      } else {
        throw new Error('Token refresh failed. User must login again.');
      }
    }

    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
};

/**
 * Example usage:
 * 
 * // GET request
 * const response = await authenticatedFetch('/api/user-profile');
 * const data = await response.json();
 * 
 * // POST request
 * const response = await authenticatedFetch('/api/products', {
 *   method: 'POST',
 *   body: { name: 'New Product', price: 100 }
 * });
 */
