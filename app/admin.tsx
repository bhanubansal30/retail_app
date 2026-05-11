import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getSession } from '@/constants/session';

const API_URL = 'http://192.168.32.19:3000';
const ADMIN_TOKEN = 'change-me';

type Retailer = {
  id: string;
  firmName: string;
  proprietorName: string;
  mobileNumber: string;
  userId: string | null;
  isVerified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type VerifyResponse = {
  userId: string;
  password: string;
};

export default function AdminScreen() {
  const [sessionReady, setSessionReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsAdmin(session?.role === 'ADMIN');
    setSessionReady(true);
  }, []);

  const fetchRetailers = async (isRefresh = false) => {
    if (!isAdmin) {
      return;
    }

    if (ADMIN_TOKEN === 'change-me') {
      Alert.alert('Admin token missing', 'Update ADMIN_TOKEN in admin.tsx to access admin data.');
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const adminUserId = getSession()?.userId ?? '';
      const res = await fetch(`${API_URL}/admin/retailers`, {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
          'x-admin-userid': adminUserId,
        },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch retailers');
      }

      setRetailers(data.data || []);
    } catch (error: any) {
      Alert.alert('Admin Error', error?.message || 'Unable to load retailers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const verifyRetailer = async (retailer: Retailer) => {
    if (ADMIN_TOKEN === 'change-me') {
      Alert.alert('Admin token missing', 'Update ADMIN_TOKEN in admin.tsx to verify users.');
      return;
    }

    try {
      const adminUserId = getSession()?.userId ?? '';
      const res = await fetch(`${API_URL}/admin/verify-retailer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
          'x-admin-userid': adminUserId,
        },
        body: JSON.stringify({ retailerId: retailer.id }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Verification failed');
      }

      const credentials = data.data as VerifyResponse;

      setRetailers((prev) =>
        prev.map((item) =>
          item.id === retailer.id
            ? { ...item, isVerified: true, userId: credentials.userId }
            : item
        )
      );

      Alert.alert(
        'User verified',
        `User ID: ${credentials.userId}\nPassword: ${credentials.password}`
      );
    } catch (error: any) {
      Alert.alert('Verify Failed', error?.message || 'Unable to verify user');
    }
  };

  useEffect(() => {
    if (sessionReady && isAdmin) {
      fetchRetailers();
    }
  }, [sessionReady, isAdmin]);

  if (!sessionReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1F3B2C" />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.deniedContainer}>
        <Text style={styles.deniedTitle}>Access denied</Text>
        <Text style={styles.deniedText}>Admin role required to view this page.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchRetailers(true)}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.headerCell, styles.colFirm]}>Firm</Text>
        <Text style={[styles.cell, styles.headerCell, styles.colMobile]}>Mobile</Text>
        <Text style={[styles.cell, styles.headerCell, styles.colUser]}>User ID</Text>
        <Text style={[styles.cell, styles.headerCell, styles.colStatus]}>Verified</Text>
        <Text style={[styles.cell, styles.headerCell, styles.colAction]}>Action</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1F3B2C" />
        </View>
      ) : (
        <FlatList
          data={retailers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchRetailers(true)} />}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, styles.colFirm]} numberOfLines={1}>
                {item.firmName}
              </Text>
              <Text style={[styles.cell, styles.colMobile]} numberOfLines={1}>
                {item.mobileNumber}
              </Text>
              <Text style={[styles.cell, styles.colUser]} numberOfLines={1}>
                {item.userId || '—'}
              </Text>
              <Text style={[styles.cell, styles.colStatus]}>
                {item.isVerified ? 'Yes' : 'No'}
              </Text>
              <View style={styles.colAction}>
                {item.isVerified ? (
                  <Text style={styles.verifiedText}>Done</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => verifyRetailer(item)}
                  >
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No retailers found</Text>
              <Text style={styles.emptyText}>Registered users will appear here.</Text>
            </View>
          }
          contentContainerStyle={retailers.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F2ED',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F2ED',
  },
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F4F2ED',
  },
  deniedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3D2C1E',
    marginBottom: 6,
  },
  deniedText: {
    fontSize: 14,
    color: '#6D6353',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2F2A1E',
    letterSpacing: -0.5,
  },
  refreshButton: {
    backgroundColor: '#1F3B2C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E9E2D6',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  cell: {
    fontSize: 12,
    color: '#3D2C1E',
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  colFirm: {
    flex: 1.4,
  },
  colMobile: {
    flex: 1.2,
  },
  colUser: {
    flex: 1,
  },
  colStatus: {
    flex: 0.7,
    textAlign: 'center',
  },
  colAction: {
    flex: 1,
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#2B5D45',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  verifiedText: {
    color: '#6D6353',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3D2C1E',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#6D6353',
  },
});
