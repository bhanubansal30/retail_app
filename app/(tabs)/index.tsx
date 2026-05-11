import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getSession } from '@/constants/session';

export default function HomeScreen() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsAdmin(session?.role === 'ADMIN');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>You are logged in. Manage your shop here.</Text>
      {isAdmin ? (
        <TouchableOpacity style={styles.adminButton} onPress={() => router.push('/admin')}>
          <Text style={styles.adminButtonText}>Open Admin Panel</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  adminButton: {
    marginTop: 20,
    backgroundColor: '#1F3B2C',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});