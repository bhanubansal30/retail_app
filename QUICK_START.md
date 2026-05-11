# Quick Start Guide - Token Authentication

## ✅ What Was Implemented

### Authentication System Features:
- ✅ **Access Tokens** - 7 days expiration
- ✅ **Refresh Tokens** - 30 days expiration  
- ✅ **Auto Token Refresh** - Seamless background refresh when access token expires
- ✅ **Persistent Storage** - Tokens survive app restarts
- ✅ **Auto Login** - User stays logged in after refresh
- ✅ **Protected Routes** - Dashboard only accessible with valid tokens
- ✅ **Logout** - Clear tokens and redirect to login

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
# In root directory (client app)
npm install

# In server directory
cd server
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in server directory:
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/myapp
JWT_SECRET=your-super-secret-key-here (generate a random string)
```

**Important**: In production, use a strong random JWT_SECRET like:
```
JWT_SECRET=abc123xyz789pqr456def789ghi012jkl345mno678pqr901stu234vwx
```

### Step 3: Start the Server
```bash
cd server
npm run dev
```

The server should output: `Server running on port 3000`

### Step 4: Start the Client App
In a new terminal:
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

## 📱 Testing the Flow

### Test 1: Initial Login
1. App starts → Shows Loading screen
2. No saved tokens → Redirects to Login page
3. Enter credentials → Shows Dashboard
4. Tokens automatically saved to AsyncStorage

### Test 2: App Restart (within 7 days)
1. Kill and restart app
2. App checks tokens → Finds valid access token
3. Verifies with server → Success
4. Shows Dashboard immediately (no re-login needed)

### Test 3: Token Refresh (after 7+ days)
1. To test, modify `ACCESS_TOKEN_EXPIRY` in `server/src/index.ts`:
   ```typescript
   const ACCESS_TOKEN_EXPIRY = '1m'; // 1 minute instead of 7 days
   ```
2. Wait 1 minute
3. Make an API call → App auto-refreshes token in background
4. User continues without interruption

### Test 4: Logout
1. Go to Profile page
2. Tap "Logout" button
3. Confirm logout
4. Tokens cleared → Redirects to Login page

### Test 5: Forced Login (after 30 days)
1. Modify in `server/src/index.ts`:
   ```typescript
   const REFRESH_TOKEN_EXPIRY = '1m'; // 1 minute instead of 30 days
   ```
2. Wait 1 minute
3. Restart app → Cannot refresh token
4. Redirects to Login page

## 📁 New Files Created

**Client Side:**
```
utils/
  ├── tokenStorage.ts          # Token persistence
  ├── authAPI.ts               # API endpoints
  ├── authContext.tsx          # Global auth state
  └── authenticatedFetch.ts    # Helper for authenticated API calls
```

**Documentation:**
```
AUTHENTICATION_SETUP.md        # Complete documentation
server/.env.example           # Environment variables template
QUICK_START.md               # This file
```

## 🔌 Using Authenticated API Calls

For any API calls that need authentication, use the `authenticatedFetch` helper:

```typescript
import { authenticatedFetch } from '@/utils/authenticatedFetch';

// Example: GET request
const response = await authenticatedFetch('/api/products');
const data = await response.json();

// Example: POST request
const response = await authenticatedFetch('/api/orders', {
  method: 'POST',
  body: { productId: 123, quantity: 5 }
});
```

The helper automatically:
- Adds Authorization header with access token
- Detects expired tokens
- Refreshes token if needed
- Retries the request

## 🛡️ Important Security Notes

1. **JWT_SECRET**: Must be changed in production
2. **HTTPS**: Always use HTTPS in production (not HTTP)
3. **Token Storage**: AsyncStorage is not encrypted
   - For sensitive apps, use `expo-secure-store`
4. **Password Encryption**: Currently commented out in server
   - Uncomment and use bcrypt for real passwords

## 🐛 Troubleshooting

### Issue: "No tokens found" error on login
- Check API_URL matches server address
- Verify server is running on port 3000
- Check browser console for network errors

### Issue: User redirected to login after app restart
- Check if tokens expired (ACCESS_TOKEN_EXPIRY: 7d)
- Verify DATABASE_URL is correct
- Check server logs for JWT errors

### Issue: "Invalid or expired access token" error
- JWT_SECRET might have changed
- Restart server to clear any cached state
- Clear app data and re-login

### Issue: AsyncStorage not working
- On web: Use localStorage fallback
- On native: Check if storage is full
- Try: `npm install @react-native-async-storage/async-storage@latest`

## 📊 Token Expiry Configuration

Edit in `server/src/index.ts`:

```typescript
// Current settings
const ACCESS_TOKEN_EXPIRY = '7d';    // Access token valid for 7 days
const REFRESH_TOKEN_EXPIRY = '30d';  // Refresh token valid for 30 days

// Other options: '1m', '1h', '1d', '7d', '30d', etc.
```

## ✨ Next Steps

1. ✅ Test all flows above
2. ⬜ Implement password validation with bcrypt
3. ⬜ Add 2FA (two-factor authentication) - optional
4. ⬜ Implement token blacklist for security
5. ⬜ Add biometric authentication - optional
6. ⬜ Set up production environment with proper secrets

## 📞 Support

Check `AUTHENTICATION_SETUP.md` for:
- Complete API documentation
- Implementation details
- Advanced configuration

For security concerns, review:
- Token expiry times
- JWT_SECRET generation
- Production HTTPS setup
- Secure storage options

---

Happy coding! 🎉
