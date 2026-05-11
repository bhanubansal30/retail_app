import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';
const ROLE_KEY = 'user_role';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: string;
}

export const tokenStorage = {
  // Save tokens
  saveTokens: async (tokens: StoredTokens): Promise<void> => {
    try {
      console.log('Tokens to save:', { 
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        userId: tokens.userId,
        role: tokens.role,
      });
      
      if (!tokens.accessToken || !tokens.refreshToken || !tokens.userId || !tokens.role) {
        throw new Error('Missing required token fields: ' + JSON.stringify(tokens));
      }
      
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, tokens.accessToken],
        [REFRESH_TOKEN_KEY, tokens.refreshToken],
        [USER_ID_KEY, tokens.userId],
        [ROLE_KEY, tokens.role],
      ]);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  // Get all tokens
  getTokens: async (): Promise<StoredTokens | null> => {
    try {
      const values = await AsyncStorage.multiGet([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_ID_KEY,
        ROLE_KEY,
      ]);

      const [accessToken, refreshToken, userId, role] = values.map(
        (item) => item[1]
      );

      if (!accessToken || !refreshToken || !userId || !role) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        userId,
        role,
      };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  },

  // Get access token
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  },

  // Clear all tokens (logout)
  clearTokens: async (): Promise<void> => {
    try {
      console.log('🔓 Clearing all stored tokens from AsyncStorage...');
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_ID_KEY,
        ROLE_KEY,
      ]);
      console.log('✓ All tokens cleared successfully');
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },

  // Update access token (when refreshed)
  updateAccessToken: async (accessToken: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } catch (error) {
      console.error('Error updating access token:', error);
      throw error;
    }
  },
};
