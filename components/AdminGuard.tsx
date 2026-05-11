import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/utils/authContext';
import { Ionicons } from '@expo/vector-icons';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      console.log('🚫 Non-admin tried to access admin page, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user?.role, router]);

  // If not admin, don't render children at all - just show redirect message
  if (user?.role !== 'ADMIN') {
    return (
      <View style={styles.container}>
        <Ionicons name="lock-closed" size={60} color="#e74c3c" />
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>
          Redirecting to dashboard...
        </Text>
        <Text style={styles.role}>Your role: {user?.role || 'Unknown'}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },
  role: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
  },
});
