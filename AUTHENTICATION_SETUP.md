# Authentication & Token Management Setup Guide

## Overview
This document explains the token-based authentication system implemented in your Expo app with access tokens (7-day expiration) and refresh tokens (30-day expiration).

## How It Works

### 1. **Token Lifecycle**
- **Access Token**: Valid for 7 days. Used to authenticate API requests.
- **Refresh Token**: Valid for 30 days. Used to get a new access token when the current one expires.
- **Auto-refresh**: When the access token expires, the app automatically uses the refresh token to get a new one.
- **Re-login Required**: If the refresh token expires (30 days), user must log in again.

### 2. **Persistent Storage**
Tokens are stored in AsyncStorage (secure persistent storage) so they survive app restarts:
- Access token
- Refresh token
- User ID
- User role

### 3. **App Startup Flow**
```
App Start
  ↓
Check if tokens exist in storage
  ↓
If tokens exist → Verify access token
  ├─ If valid → Show Dashboard
  ├─ If expired → Auto-refresh using refresh token
  │   ├─ Success → Show Dashboard
  │   └─ Failed → Show Login
  └─ If no tokens → Show Login
```

## Implementation Details

### Client Side Files Created

#### 1. **utils/tokenStorage.ts**
- Manages token persistence with AsyncStorage
- Functions:
  - `saveTokens()`: Save all tokens to storage
  - `getTokens()`: Retrieve all tokens
  - `getAccessToken()`: Get just the access token
  - `getRefreshToken()`: Get just the refresh token
  - `clearTokens()`: Clear all tokens (logout)
  - `updateAccessToken()`: Update token after refresh

#### 2. **utils/authAPI.ts**
- API client for authentication endpoints
- Functions:
  - `login()`: Send credentials to server
  - `refreshAccessToken()`: Refresh using refresh token
  - `verifyToken()`: Check if token is still valid
  - `logout()`: Clear tokens and logout

#### 3. **utils/authContext.tsx**
- React Context for global auth state
- Provides:
  - `useAuth()` hook with:
    - `user`: Current user data
    - `isLoading`: Loading state
    - `isAuthenticated`: Auth status
    - `login()`: Login function
    - `logout()`: Logout function
    - `checkAuth()`: Check auth on startup
    - `refreshToken()`: Manually refresh tokens

### Server Side Changes

#### 1. **Dependencies Added**
```json
{
  "jsonwebtoken": "^9.1.2",
  "@types/jsonwebtoken": "^9.0.5"
}
```

#### 2. **New Endpoints**

**POST /login**
- Returns: `accessToken` and `refreshToken` (in addition to user data)
- Token expiry: Access token 7d, Refresh token 30d

**POST /refresh-token**
- Input: `{ refreshToken }`
- Returns: New access token and optionally new refresh token
- Validates refresh token and generates new access token

**GET /verify-token**
- Header: `Authorization: Bearer {accessToken}`
- Returns: Success if token is valid
- Used by app to verify token validity on startup

**POST /logout**
- Header: `Authorization: Bearer {accessToken}`
- Clears server-side tokens (optional)

### Updated Files

#### Client App Files
- **app/_layout.tsx**: Now wraps app with AuthProvider, handles auth checks, and conditional routing
- **app/login.tsx**: Uses `useAuth()` hook instead of direct API calls
- **app/dashboard.tsx**: Displays user info from context
- **app/profile.tsx**: Updated logout button to use auth context
- **package.json**: Added @react-native-async-storage/async-storage dependency

#### Server Files
- **server/src/index.ts**: Added JWT support, token generation, and new endpoints
- **server/package.json**: Added jsonwebtoken dependency

## Environment Setup

### 1. **Server Environment Variables**
Create a `.env` file in the server directory:
```
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
JWT_SECRET=your-very-secure-secret-key-change-this-in-production
```

### 2. **Install Dependencies**
```bash
# Client app
npm install

# Server
cd server && npm install
```

### 3. **Start the Server**
```bash
cd server
npm run dev  # For development with nodemon
```

## Token Expiry Configuration

Edit in `server/src/index.ts`:
```typescript
const ACCESS_TOKEN_EXPIRY = '7d';  // Access token expiry
const REFRESH_TOKEN_EXPIRY = '30d'; // Refresh token expiry
```

## Security Considerations

1. **JWT_SECRET**: Change the secret key in production to a strong, random value
2. **HTTPS**: Always use HTTPS in production
3. **Token Blacklisting**: For enhanced security, maintain a token blacklist for logged-out tokens
4. **Secure Storage**: AsyncStorage is not encrypted; for highly sensitive apps, consider:
   - `expo-secure-store` for iOS Keychain/Android Keystore
   - Native module for device-level encryption

## Testing Flow

1. **First Login**:
   - User enters credentials
   - App receives access token + refresh token
   - Tokens saved to AsyncStorage
   - User redirected to Dashboard

2. **App Restart**:
   - App checks for saved tokens
   - Verifies access token with server
   - If valid: Dashboard shown immediately
   - If expired: Auto-refresh happens silently
   - If refresh fails: User redirected to login

3. **After 7 Days**:
   - Access token expires
   - App auto-refreshes in background
   - User continues without interruption

4. **After 30 Days**:
   - Refresh token expires
   - App cannot refresh
   - User redirected to login
   - Must enter credentials again

5. **Logout**:
   - User taps logout button
   - `useAuth().logout()` called
   - Tokens cleared from AsyncStorage
   - User redirected to login

## API Integration Example

To use the access token in API calls:

```typescript
const accessToken = await tokenStorage.getAccessToken();

const response = await fetch(`${API_URL}/some-endpoint`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

## Troubleshooting

**Issue**: User still on login after tokens exist
- Check AsyncStorage is working: Device Storage might be full
- Verify JWT_SECRET matches between server restarts
- Check token expiry times

**Issue**: Token verification fails
- Ensure server is running
- Check if JWT_SECRET changed
- Verify API_URL in the app matches server URL

**Issue**: App crashes on startup
- Check if AsyncStorage is properly installed
- Verify AuthProvider wraps all screens
- Check browser console for errors

## Next Steps

1. Test the complete authentication flow
2. Implement password encryption with bcrypt on server
3. Add user refresh token tracking in database
4. Implement token blacklist for logout
5. Add biometric authentication
6. Implement remember-me functionality
