import { useAuth } from '@/utils/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert('Missing Fields', 'Please enter user ID and password.');
      return;
    }

    setLoading(true);
    try {
      console.log('Login request payload:', { userId, password });
      await login(userId, password);
      
      // Wait a moment for state to update
      setTimeout(() => {
        console.log('✅ Login successful, checking role:', user?.role);
        Alert.alert('Welcome back', 'Login successful.');
        
        // Navigate based on role
        const isAdmin = user?.role === 'ADMIN';
        console.log('🔍 Is Admin:', isAdmin);
        
        if (isAdmin) {
          console.log('📊 Navigating to admin dashboard');
          router.replace('/admin-dashboard');
        } else {
          console.log('🏪 Navigating to user dashboard');
          router.replace('/dashboard');
        }
      }, 500);
    } catch (error: any) {
      console.error('Login failed:', error?.message || error);
      Alert.alert('Login Failed', error?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/606/606544.png' }}
            style={styles.logo}
          />
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subHeading}>Login to manage your shop</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>User ID</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-circle-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your user ID"
              autoCapitalize="none"
              value={userId}
              onChangeText={setUserId}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to Retail Hub?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F2ED',
  },
  container: {
    padding: 24,
    paddingTop: 36,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2F2A1E',
    letterSpacing: -0.6,
  },
  subHeading: {
    fontSize: 14,
    color: '#6D6353',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D6353',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8DEC8',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2B5D45',
    height: 56,
    borderRadius: 16,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B5D45',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9EC1A7',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  footerLink: {
    color: '#2B5D45',
    fontSize: 14,
    fontWeight: '800',
  },
});
