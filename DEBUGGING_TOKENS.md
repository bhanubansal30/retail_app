# Token Generation Debugging Guide

## Issue: "[AsyncStorage] Passing null/undefined as value is not supported"

This error means the `accessToken` or `refreshToken` from the server is `undefined`.

## Diagnostic Steps

### Step 1: Check Server Logs
When you try to login, look for these logs in the server terminal:

```
🔍 Login attempt for userId: bhanu
✓ User found: { id: '...', userId: 'bhanu', role: 'USER' }
✓ Access token generated successfully
✓ Refresh token generated successfully
✓ Sending login response with tokens
```

**If you see these**: ✅ Server is working correctly
**If you don't see these**: ❌ Proceed to Step 2

### Step 2: Check Client Logs (Console in Expo)
Look for the server response:

```
Server login response: {
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "...",
    "userId": "bhanu",
    "firmName": "...",
    "isVerified": true,
    "role": "USER",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**If tokens are present**: ✅ Server response is correct
**If tokens are missing/undefined**: ❌ Server is not generating tokens properly

### Step 3: Verify JWT_SECRET is Set
The server needs a JWT_SECRET to generate tokens.

**Option A: Using .env file**
```bash
# In server directory
echo "JWT_SECRET=test-secret-key-12345" > .env
```

**Option B: Set as environment variable**
```bash
# Windows
set JWT_SECRET=test-secret-key-12345
npm run dev

# macOS/Linux
JWT_SECRET=test-secret-key-12345 npm run dev
```

### Step 4: Verify jsonwebtoken is Installed
```bash
cd server
npm ls jsonwebtoken
```

Should show: `jsonwebtoken@^9.1.2`

If not, install it:
```bash
npm install jsonwebtoken
```

### Step 5: Restart Everything

**Close everything and restart:**

```bash
# Terminal 1: Stop and restart server
cd server
npm run dev

# Terminal 2: Stop and restart client
# Press Ctrl+C in Expo terminal
npm start
```

### Step 6: Test Login Again
1. Open app
2. Try login with credentials
3. Check both server and client console logs

## Common Issues & Fixes

### Issue: "Cannot find module 'jsonwebtoken'"
**Fix:**
```bash
cd server
npm install jsonwebtoken @types/jsonwebtoken
npm run dev
```

### Issue: Server says "JWT_SECRET is not configured"
**Fix:** Add to `server/.env` file:
```
JWT_SECRET=your-secret-key-here
```

### Issue: Tokens show as `undefined` in client response
**Fix:** 
1. Check server logs for errors during token generation
2. Verify JWT_SECRET is set
3. Check if `generateAccessToken` and `generateRefreshToken` functions are being called

### Issue: Server crashes with JWT errors
**Fix:**
- Clear and reinstall dependencies:
  ```bash
  cd server
  rm -rf node_modules package-lock.json
  npm install
  npm run dev
  ```

## Expected Output After Successful Login

**Server Console:**
```
🔍 Login attempt for userId: bhanu
✓ User found: { id: 'RT-ABC123', userId: 'bhanu', role: 'USER' }
✓ Access token generated successfully
✓ Refresh token generated successfully
✓ Sending login response with tokens
```

**Client Console:**
```
LOG  Login request payload: {"password": "bhanu@1234", "userId": "bhanu"}

Server login response: {
  "success": true,
  "message": "Login successful",
  "data": {
    ...
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Tokens to save: {
  "hasAccessToken": true,
  "hasRefreshToken": true,
  "userId": "bhanu",
  "role": "USER"
}
```

## Quick Checklist

- [ ] JWT_SECRET is set in `server/.env` or environment
- [ ] `npm install jsonwebtoken` ran in server directory
- [ ] Server was restarted after installing jsonwebtoken
- [ ] Client and server are running
- [ ] Server logs show token generation succeeded
- [ ] Client logs show tokens in response
- [ ] Tokens are NOT undefined

## If Issue Persists

1. **Check server error logs** for any JWT errors
2. **Verify database connection** - make sure user exists in database
3. **Try with a fresh login** - clear app cache if on native
4. **Check API_URL** - make sure client can reach server (should match server IP:port)

---

**Command to tail server logs:**
```bash
cd server && npm run dev 2>&1 | tee server.log
```

This saves logs to `server.log` file for inspection.
