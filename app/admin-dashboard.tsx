import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/utils/authContext';
import { AdminGuard } from '@/components/AdminGuard';
import { Ionicons } from '@expo/vector-icons';

interface AdminStats {
  totalUsers: number;
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCategories: 0,
    totalProducts: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    // TODO: Fetch admin stats from API
    setStats({
      totalUsers: 0,
      totalCategories: 0,
      totalProducts: 0,
      totalOrders: 0,
    });
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Categories',
      icon: 'list',
      color: '#3498db',
      route: '/admin-categories',
      description: 'Manage categories',
    },
    {
      title: 'Add Category',
      icon: 'add-circle',
      color: '#2ecc71',
      route: '/admin-add-category',
      description: 'Create new category',
    },
    {
      title: 'Products',
      icon: 'cube',
      color: '#9b59b6',
      route: '/admin-products',
      description: 'Manage products',
    },
    {
      title: 'Add Product',
      icon: 'add',
      color: '#e74c3c',
      route: '/admin-add-product',
      description: 'Create new product',
    },
    {
      title: 'Orders',
      icon: 'receipt',
      color: '#f39c12',
      route: '/admin-orders',
      description: 'View all orders',
    },
    {
      title: 'Users',
      icon: 'people',
      color: '#1abc9c',
      route: '/admin-users',
      description: 'Manage users',
    },
  ];

  return (
    <AdminGuard>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.userId}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatCard label="Total Users" value={stats.totalUsers} icon="people" />
            <StatCard label="Categories" value={stats.totalCategories} icon="list" />
            <StatCard label="Products" value={stats.totalProducts} icon="cube" />
            <StatCard label="Orders" value={stats.totalOrders} icon="receipt" />
          </View>

          {/* Menu */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { borderLeftColor: item.color }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={28} color="#fff" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </AdminGuard>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={32} color="#2B5D45" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
    backgroundColor: '#2B5D45',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a8d5ba',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B5D45',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  menuDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
});
