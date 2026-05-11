# Complete Token Fix Guide - Error: "Server did not return valid tokens"

## What This Error Means

The server is running and responding, but:
- ❌ `accessToken` is `undefined` or `null`
- ❌ `refreshToken` is `undefined` or `null`

This almost always means **JWT_SECRET is not configured**.

---

## 🚀 Quick Fix (3 Steps)

### Step 1: Create JWT_SECRET

**Navigate to server folder:**
```bash
cd server
```

**Create .env file with JWT_SECRET:**

**Windows (Command Prompt):**
```cmd
echo JWT_SECRET=my-super-secret-key-12345 > .env
```

**Windows (PowerShell):**
```powershell
echo 'JWT_SECRET=my-super-secret-key-12345' > .env
```

**Mac/Linux:**
```bash
echo "JWT_SECRET=my-super-secret-key-12345" > .env
```

**Verify it was created:**
```bash
cat .env   # Mac/Linux
type .env  # Windows
```

Should output:
```
JWT_SECRET=my-super-secret-key-12345
```

### Step 2: Restart Server

```bash
cd server
npm run dev
```

**Look for this in server output:**
```
✓ JWT_SECRET is configured
Server running on http://0.0.0.0:3000
```

### Step 3: Try Login Again

1. In Expo app, enter login credentials
2. Watch **server console** for token logs
3. Should see:
   ```
   ✓ Access token generated successfully
   ✓ Refresh token generated successfully
   ```

---

## 🧪 Test if Tokens are Working

### Method 1: Use Debug Component (Easiest)

Add to your `app/login.tsx` temporarily:

```tsx
import TokenDebug from '@/components/TokenDebug';

export default function LoginScreen() {
  return (
    <View>
      <TokenDebug />  {/* Add this line */}
      
      {/* Rest of your login UI */}
    </View>
  );
}
```

Then:
1. Run app
2. Find the **"🧪 Run Token Generation Test"** button
3. Tap it
4. Check console logs for results

### Method 2: Manual Test via Console

Add this to any component temporarily:

```tsx
import { testTokenGeneration } from '@/utils/testTokens';
import { useEffect } from 'react';

export default function TestScreen() {
  useEffect(() => {
    testTokenGeneration();
  }, []);
  
  return <Text>Check console...</Text>;
}
```

---

## ✅ Checklist

After following the steps above:

- [ ] Created `server/.env` file
- [ ] Added `JWT_SECRET=...` to .env
- [ ] Saved the file
- [ ] Server was restarted (`npm run dev`)
- [ ] Server shows `✓ JWT_SECRET is configured`
- [ ] Client app was also restarted
- [ ] Tried login again
- [ ] Server shows token generation logs
- [ ] No more "Server did not return valid tokens" error

---

## What the Logs Should Show

### Server Console (when you try to login):
```
🔍 Login attempt for userId: bhanu
✓ User found: { id: 'RT-ABC123', userId: 'bhanu', role: 'USER' }
✓ Access token generated successfully
✓ Refresh token generated successfully
✓ Sending login response with tokens
```

### Client Console (Expo):
```
LOG  Login request payload: {"userId":"bhanu","password":"bhanu@1234"}

Server login response: {
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "RT-ABC123",
    "userId": "bhanu",
    "firmName": "...",
    "isVerified": true,
    "role": "USER",
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

If you see this → ✅ **It's working!**

---

## Troubleshooting

### Issue: Server still shows `⚠️  WARNING: JWT_SECRET not set`

**Solution:**
1. Check if `.env` file exists: `cat server/.env`
2. Check if it has JWT_SECRET: `grep JWT_SECRET server/.env`
3. If not, create it again: `echo JWT_SECRET=test-key > server/.env`
4. **Restart server** - it needs to reload the .env file

### Issue: Server says "User not found"

**Solution:**
The user `bhanu` doesn't exist in your database.

Options:
1. Use correct credentials for an existing user
2. Or create the user first via the signup endpoint
3. Or use the admin panel to create a user

### Issue: "Cannot reach server"

**Solution:**
1. Verify server is running: `cd server && npm run dev`
2. Verify correct IP/port - should match `http://192.168.3.19:3000` in `app/login.tsx`
3. Check if both devices are on same network

### Issue: Tokens are still undefined

**Solution:**
1. Check server logs for the 4 success messages
2. If tokens don't appear, there's an issue with jwt library
3. Reinstall jwt:
   ```bash
   cd server
   npm install jsonwebtoken
   npm run dev
   ```

---

## Full Restart if Nothing Works

```bash
# Terminal 1 - Server
cd server
rm -rf node_modules package-lock.json
npm install
echo JWT_SECRET=test-key-12345 > .env
npm run dev

# Terminal 2 - Client (new terminal)
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## Need Help?

Check the detailed guides:
- [DEBUGGING_TOKENS.md](DEBUGGING_TOKENS.md) - Complete diagnostic guide
- [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md) - Architecture overview
- [QUICK_START.md](QUICK_START.md) - General setup guide

Or:
1. Run the test (TokenDebug component)
2. Share the console output
3. We can identify the exact issue
