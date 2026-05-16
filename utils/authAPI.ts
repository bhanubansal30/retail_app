import { tokenStorage } from './tokenStorage';

const API_URL = 'http://192.168.3.19:3000';
// const API_URL = 'https://retail-app-siqh.onrender.com';

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    userId: string;
    firmName: string;
    proprietorName: string;
    mobileNumber: string;
    addressLine1: string;
    city?: string;
    state?: string;
    pincode?: string;
    businessType: string;
    isVerified: boolean;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    userId: string;
    firmName: string;
    proprietorName?: string;
    mobileNumber?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    businessType?: string;
    isVerified: boolean;
    role: string;
  };
}

export const authAPI = {
  // Login endpoint
  login: async (userId: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('[authAPI] Sending login request for userId:', userId);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      console.log('[authAPI] Response status:', response.status);
      const data = await response.json();
      
      console.log('[authAPI] Full server response:', JSON.stringify(data, null, 2));
      console.log('[authAPI] Response.success:', data.success);
      console.log('[authAPI] Response.data exists:', !!data.data);
      console.log('[authAPI] Response.data.accessToken exists:', !!data.data?.accessToken);
      console.log('[authAPI] Response.data.refreshToken exists:', !!data.data?.refreshToken);
      
      if (data.data?.accessToken) {
        console.log('[authAPI] Access token length:', data.data.accessToken.length);
        console.log('[authAPI] Access token preview:', data.data.accessToken.substring(0, 50) + '...');
      }
      if (data.data?.refreshToken) {
        console.log('[authAPI] Refresh token length:', data.data.refreshToken.length);
        console.log('[authAPI] Refresh token preview:', data.data.refreshToken.substring(0, 50) + '...');
      }
      
      return data;
    } catch (error) {
      console.error('[authAPI] Login error:', error);
      throw error;
    }
  },

  // Refresh token endpoint
  refreshAccessToken: async (
    refreshToken: string
  ): Promise<RefreshTokenResponse> => {
    try {
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      return await response.json();
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  // Verify token is still valid
  verifyToken: async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/verify-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Verify token error:', error);
      return false;
    }
  },

  // Logout (clear tokens from server if needed)
  logout: async (accessToken: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Always clear local tokens
      await tokenStorage.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local tokens even if server request fails
      await tokenStorage.clearTokens();
    }
  },

  // Update user profile
  updateProfile: async (
    userId: string,
    accessToken: string,
    profileData: {
      proprietorName?: string;
      mobileNumber?: string;
      addressLine1?: string;
      city?: string;
      state?: string;
      pincode?: string;
      businessType?: string;
    }
  ): Promise<UpdateProfileResponse> => {
    try {
      console.log('📝 [authAPI] Updating profile for userId:', userId);
      const response = await fetch(`${API_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      console.log('✓ Profile updated successfully:', data.data);
      return data;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  },
};
