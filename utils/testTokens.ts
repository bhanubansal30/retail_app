/**
 * Manual Token Test - Run this in Expo to test server token generation
 * 
 * Usage in your component or app startup:
 * 
 * import { testTokenGeneration } from '@/utils/testTokens';
 * 
 * useEffect(() => {
 *   testTokenGeneration();
 * }, []);
 */

const API_URL = 'http://192.168.3.19:3000';

export const testTokenGeneration = async () => {
  console.log('\n========== TOKEN GENERATION TEST ==========');
  console.log('Testing: POST /login with test credentials\n');

  try {
    // Test 1: Basic connectivity
    console.log('📡 Test 1: Server Connectivity');
    try {
      const pingResponse = await fetch(`${API_URL}/`);
      console.log('✓ Server is reachable');
    } catch (error) {
      console.error('❌ Cannot reach server at', API_URL);
      console.error('Make sure server is running: cd server && npm run dev');
      return;
    }

    // Test 2: Login without tokens
    console.log('\n🔐 Test 2: Login & Token Generation');
    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'bhanu', password: 'bhanu@1234' }),
    });

    const loginData = await loginResponse.json();

    console.log('\n📨 Server Response Status:', loginResponse.status);
    console.log('📨 Server Response:', JSON.stringify(loginData, null, 2));

    // Test 3: Analyze response
    console.log('\n🔍 Analysis:');

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      console.error('   This usually means:');
      console.error('   - User "bhanu" does not exist in database');
      console.error('   - User has no password hash');
      return;
    }

    if (!loginData.data) {
      console.error('❌ No data in response');
      return;
    }

    const { accessToken, refreshToken, userId, role } = loginData.data;

    console.log('✓ Login success:', { userId, role });

    if (!accessToken) {
      console.error(
        '❌ accessToken is missing/undefined',
        '\n   Possible causes:',
        '\n   1. JWT_SECRET not set in server .env',
        '\n   2. jsonwebtoken not installed',
        '\n   3. Token generation failed silently'
      );
    } else {
      console.log('✓ Access token received:', accessToken.substring(0, 30) + '...');
    }

    if (!refreshToken) {
      console.error(
        '❌ refreshToken is missing/undefined',
        '\n   Possible causes:',
        '\n   1. JWT_SECRET not set in server .env',
        '\n   2. jsonwebtoken not installed',
        '\n   3. Token generation failed silently'
      );
    } else {
      console.log('✓ Refresh token received:', refreshToken.substring(0, 30) + '...');
    }

    // Test 4: Decode tokens (basic check)
    if (accessToken && refreshToken) {
      console.log('\n✅ TOKENS GENERATED SUCCESSFULLY');
      console.log('   Both accessToken and refreshToken are present');
      console.log('   Your login should now work!');
    } else {
      console.log('\n❌ TOKENS NOT GENERATED');
      console.log('   Check server logs for errors');
      console.log('   Especially look for: JWT_SECRET or token generation errors');
    }
  } catch (error: any) {
    console.error('\n❌ Test Error:', error.message);
    console.error('\nPossible causes:');
    console.error('1. Server not running (run: cd server && npm run dev)');
    console.error('2. Wrong API_URL (current:', API_URL + ')');
    console.error('3. Network issues');
  }

  console.log('\n==========================================\n');
};

/**
 * Decode JWT Token (without verification - for debugging only)
 * WARNING: This doesn't verify signature, only decodes payload
 */
export const decodeToken = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    console.log('Decoded token payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
