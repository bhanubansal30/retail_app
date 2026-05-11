# Quick Fix: "Server did not return valid tokens" Error

## Immediate Action Required

### 1. **Check Server Logs**
When you try to login, look at your **server terminal** (where you ran `npm run dev`).

Do you see ANY of these logs?
```
🔍 Login attempt for userId: bhanu
✓ User found: ...
✓ Access token generated successfully
✓ Refresh token generated successfully
```

**If YES** → Go to Step 3
**If NO** → Go to Step 2

---

## 🧪 NEW: Use Test Utility (Easiest Method)

### Add Test Component to Your App

Temporarily add this to your login screen or any component:

```tsx
import TokenDebug from '@/components/TokenDebug';

export default function LoginScreen() {
  return (
    <>
      {/* Add this temporarily */}
      <TokenDebug />
      
      {/* Your existing login UI */}
      ...
    </>
  );
}
```

### Run the Test

1. The debug panel will appear on screen
2. Tap the **"🧪 Run Token Generation Test"** button
3. Check the **Expo console logs** for detailed output

The test will tell you exactly what's wrong:
- ✓ Server is reachable
- ✓ Token generation works
- ❌ Missing JWT_SECRET
- ❌ User not found
- ❌ Token is undefined

---

## Step 1: Verify JWT_SECRET is Set

### Option A: Create .env file in server folder

```bash
# Navigate to server directory
cd server

# Create .env file with JWT_SECRET
echo JWT_SECRET=test-key-12345 > .env

# Verify it was created
type .env  # Windows
# or
cat .env   # Mac/Linux
```

### Option B: Set Environment Variable Before Running

```bash
# Windows Command Prompt
set JWT_SECRET=test-key-12345
npm run dev

# Windows PowerShell
$env:JWT_SECRET='test-key-12345'
npm run dev

# Mac/Linux
JWT_SECRET=test-key-12345 npm run dev
```

---

## Step 2: Verify jsonwebtoken is Installed

```bash
cd server
npm ls jsonwebtoken
```

Should show: `jsonwebtoken@9.1.2` or similar

**If NOT installed:**
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

---

## Step 3: Check Server Output Format

Add this test endpoint temporarily to `server/src/index.ts`:

```typescript
app.get('/test-token', (_req, res) => {
  const payload = { userId: 'test', id: '123', role: 'USER' };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
    }
  });
});
```

Then visit: `http://localhost:3000/test-token`

You should see tokens in the response. If not, there's an issue with `generateAccessToken()`.

---

## Step 4: Full Restart Sequence

**Do these in order:**

```bash
# Terminal 1 - Stop server if running (Ctrl+C)

# Clear server node_modules and reinstall
cd server
rm -rf node_modules package-lock.json
npm install

# Create .env file
echo JWT_SECRET=super-secret-key-12345 > .env

# Start server
npm run dev

# You should see: "Server running on http://0.0.0.0:3000"
```

```bash
# Terminal 2 - Stop client if running (Ctrl+C)

# Clear client node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start client
npm start
```

---

## Step 5: Try Login Again

1. In Expo app, enter credentials: `bhanu` / `bhanu@1234`
2. Watch **server terminal** for these logs:
   ```
   🔍 Login attempt for userId: bhanu
   ✓ User found: { id: '...', userId: 'bhanu', role: '...' }
   ✓ Access token generated successfully
   ✓ Refresh token generated successfully
   ✓ Sending login response with tokens
   ```

3. Watch **client console** for:
   ```
   Server login response: {
     "success": true,
     "data": {
       "accessToken": "eyJhbGc...",
       "refreshToken": "eyJhbGc...",
       ...
     }
   }
   ```

---

## Checklist ✅

- [ ] JWT_SECRET is set (in .env or environment variable)
- [ ] `npm install jsonwebtoken` completed
- [ ] Server was restarted AFTER installing packages
- [ ] Client was restarted AFTER installing packages
- [ ] Server shows all 4 success logs during login
- [ ] Tokens appear in server response (not undefined)

---

## If Still Not Working

**Copy-paste all server logs here** from when you try to login:

Look for:
- `🔍 Login attempt for userId:`
- `❌` or error messages
- Any red text

This will help identify the exact issue.

---

## Most Common Issues

| Issue | Fix |
|-------|-----|
| "JWT_SECRET not set" | Create `.env` file with `JWT_SECRET=your-key` |
| Module not found | Run `npm install jsonwebtoken` in server folder |
| "User not found" | Make sure user `bhanu` exists in database |
| Tokens undefined | Check if JWT library is working (restart server) |

---

## Windows Users - Full Setup Commands

```bash
# Terminal 1 (Server)
cd server
del node_modules /s /q
del package-lock.json
npm install
(echo JWT_SECRET=test-key-12345) > .env
npm run dev

# Terminal 2 (Client)
del node_modules /s /q
del package-lock.json
npm install
npm start
```

Let me know what logs you see! 🚀
