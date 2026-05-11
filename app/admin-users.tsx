import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/utils/authContext';
import { AdminGuard } from '@/components/AdminGuard';
import { Ionicons } from '@expo/vector-icons';

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
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'USER' | 'ADMIN'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Fetch users from API
      // For now, use mock data
      setUsers([
        {
          id: 'cmoyb35io0000ooum97zgyd4c',
          userId: 'bhanu',
          firmName: 'tttt',
          proprietorName: 'Bhanu Kumar',
          mobileNumber: '+91 9876543210',
          role: 'USER',
          isVerified: false,
          createdAt: '2026-04-23',
        },
        {
          id: 'admin123',
          userId: 'admin',
          firmName: 'Admin Store',
          proprietorName: 'Admin User',
          mobileNumber: '+91 8765432109',
          role: 'ADMIN',
          isVerified: true,
          createdAt: '2026-04-20',
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = (userId: string) => {
    Alert.alert(
      'Verify User',
      `Are you sure you want to verify ${userId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              // TODO: Call API to verify user
              setUsers(
                users.map(u =>
                  u.userId === userId ? { ...u, isVerified: true } : u
                )
              );
              Alert.alert('Success', 'User verified');
            } catch (error) {
              Alert.alert('Error', 'Failed to verify user');
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    Alert.alert(
      'Change Role',
      `Change ${userId} role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call API to update role
              setUsers(
                users.map(u =>
                  u.userId === userId ? { ...u, role: newRole } : u
                )
              );
              Alert.alert('Success', `User role changed to ${newRole}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update role');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userId}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call API to delete user
              setUsers(users.filter(u => u.userId !== userId));
              Alert.alert('Success', 'User deleted');
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
            onPress={() => handleVerifyUser(item.userId)}
          >
            <Ionicons name="checkmark" size={16} color="#27ae60" />
            <Text style={styles.actionText}>Verify</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleChangeRole(item.userId, item.role)}
        >
          <Ionicons name="swap-horizontal" size={16} color="#3498db" />
          <Text style={styles.actionText}>Role</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDeleteUser(item.userId)}
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
