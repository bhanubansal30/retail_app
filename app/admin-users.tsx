import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/utils/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.3.19:3000';

interface User {
  id: string;
  userId: string;
  firmName: string;
  proprietorName?: string;
  mobileNumber?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'USER' | 'ADMIN'>('all');

  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Load users error:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = (userId: string, userDisplayName: string, userId_raw: string) => {
    Alert.alert(
      'Verify User',
      `Are you sure you want to verify ${userDisplayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_URL}/api/users/${userId}/verify`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                throw new Error('Failed to verify user');
              }

              setUsers(
                users.map(u =>
                  u.id === userId ? { ...u, isVerified: true } : u
                )
              );
              Alert.alert('Success', 'User verified successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to verify user');
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = (userId: string, userDisplayName: string, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    Alert.alert(
      'Change Role',
      `Change ${userDisplayName} role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
              });

              if (!response.ok) {
                throw new Error('Failed to update user role');
              }

              setUsers(
                users.map(u =>
                  u.id === userId ? { ...u, role: newRole } : u
                )
              );
              Alert.alert('Success', `User role changed to ${newRole}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user role');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (userId: string, userDisplayName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userDisplayName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to delete user');
              }

              setUsers(users.filter(u => u.id !== userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = filter === 'all'
    ? users
    : users.filter(u => u.role === filter);

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.userId}</Text>
          <View style={styles.badgeContainer}>
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
            <View style={[
              styles.roleBadge,
              item.role === 'ADMIN' && styles.roleBadgeAdmin
            ]}>
              <Text style={styles.badgeText}>{item.role}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.firmName}>{item.firmName}</Text>
        {item.proprietorName && (
          <Text style={styles.proprietorName}>{item.proprietorName}</Text>
        )}
        {item.mobileNumber && (
          <View style={styles.contactRow}>
            <Ionicons name="call" size={12} color="#7f8c8d" />
            <Text style={styles.contactText}>{item.mobileNumber}</Text>
          </View>
        )}
        <Text style={styles.dateText}>
          Joined: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.userActions}>
        {!item.isVerified && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleVerifyUser(item.id, item.firmName, item.userId)}
          >
            <Ionicons name="checkmark" size={16} color="#27ae60" />
            <Text style={styles.actionText}>Verify</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleChangeRole(item.id, item.firmName, item.role)}
        >
          <Ionicons name="swap-horizontal" size={16} color="#3498db" />
          <Text style={styles.actionText}>Role</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDeleteUser(item.id, item.firmName)}
        >
          <Ionicons name="trash" size={16} color="#e74c3c" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AdminGuard>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#2B5D45" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Users</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'USER', 'ADMIN'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filter === status && styles.filterTabActive,
              ]}
              onPress={() => setFilter(status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === status && styles.filterTabTextActive,
                ]}
              >
                {status === 'all' ? 'All' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2B5D45" />
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        )}
      </View>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  filterTabActive: {
    backgroundColor: '#2B5D45',
    borderColor: '#2B5D45',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    gap: 2,
  },
  roleBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleBadgeAdmin: {
    backgroundColor: '#e74c3c',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  firmName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  proprietorName: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  dateText: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
});
