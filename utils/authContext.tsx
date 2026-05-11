import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from './authAPI';
import { tokenStorage } from './tokenStorage';

export interface User {
  userId: string;
  role: string;
  firmName?: string;
  id?: string;
  isVerified?: boolean;
  proprietorName?: string;
  mobileNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  businessType?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (profileData: {
    proprietorName?: string;
    mobileNumber?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    businessType?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on app start
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // For now, just check if user data is stored locally
      // Token validation will be added when backend sends proper tokens
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh access token using refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = await tokenStorage.getRefreshToken();

      if (!refreshTokenValue) {
        return false;
      }

      const response = await authAPI.refreshAccessToken(refreshTokenValue);

      if (response.success && response.data) {
        // Update the access token
        await tokenStorage.updateAccessToken(response.data.accessToken);

        // If new refresh token is provided, update it too
        if (response.data.refreshToken) {
          const tokens = await tokenStorage.getTokens();
          if (tokens) {
            await tokenStorage.saveTokens({
              ...tokens,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            });
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  };

  // Login
  const login = async (userId: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(userId, password);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      console.log('📦 Full login response from server:', JSON.stringify(response.data, null, 2));

      // Save user data to local storage
      const userData: User = {
        userId: response.data.userId,
        role: response.data.role,
        firmName: response.data.firmName,
        proprietorName: response.data.proprietorName,
        mobileNumber: response.data.mobileNumber,
        addressLine1: response.data.addressLine1,
        city: response.data.city,
        state: response.data.state,
        pincode: response.data.pincode,
        businessType: response.data.businessType,
        id: response.data.id,
        isVerified: response.data.isVerified,
      };

      console.log('💾 User data being saved to AsyncStorage:', JSON.stringify(userData, null, 2));

      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      // TODO: Save tokens when backend properly sends them
      // For now, we'll add token logic later
      if (response.data.accessToken && response.data.refreshToken) {
        console.log('✓ Tokens received from server, saving for later use');
        await tokenStorage.saveTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          userId: response.data.userId,
          role: response.data.role,
        });
      }

      setUser(userData);
      setIsAuthenticated(true);
      console.log('✓ User logged in successfully:', userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Call logout endpoint if token exists
      const accessToken = await tokenStorage.getAccessToken();
      if (accessToken) {
        try {
          await authAPI.logout(accessToken);
          console.log('✓ Server logout called');
        } catch (error) {
          console.error('Server logout error (continuing with local cleanup):', error);
        }
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear all local session data
      try {
        console.log('🧹 Clearing all session data...');
        
        // Remove user data
        await AsyncStorage.removeItem('user_data');
        console.log('✓ User data cleared');
        
        // Clear all tokens
        await tokenStorage.clearTokens();
        console.log('✓ Tokens cleared');
        
        // Reset auth state
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        console.log('✓ Auth state reset');
        
        console.log('✅ Logout complete - all session data removed');
      } catch (error) {
        console.error('Error clearing session data:', error);
        // Force reset state even if there's an error
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }
  };

  // Update user profile
  const updateProfile = async (profileData: {
    proprietorName?: string;
    mobileNumber?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    businessType?: string;
  }) => {
    try {
      if (!user?.userId) {
        throw new Error('User ID not found');
      }

      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not found. Please login again.');
      }

      console.log('📝 Updating profile with data:', profileData);

      const response = await authAPI.updateProfile(user.userId, accessToken, profileData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update profile');
      }

      // Update local user object
      const updatedUser: User = {
        ...user,
        proprietorName: response.data.proprietorName,
        mobileNumber: response.data.mobileNumber,
        addressLine1: response.data.addressLine1,
        city: response.data.city,
        state: response.data.state,
        pincode: response.data.pincode,
        businessType: response.data.businessType,
      };

      setUser(updatedUser);

      // Save updated user to AsyncStorage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));

      console.log('✓ Profile updated successfully:', updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        refreshToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
