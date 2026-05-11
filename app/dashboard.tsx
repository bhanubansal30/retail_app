import { useAuth } from '@/utils/authContext';
import { UserGuard } from '@/components/UserGuard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CATEGORIES = [
  { id: 1, name: 'Spices', icon: 'leaf', color: '#FF6B6B' },
  { id: 2, name: 'Dry Fruits', icon: 'nutrition', color: '#FFD93D' },
  { id: 3, name: 'Herbs', icon: 'water', color: '#6BCB77' },
  { id: 4, name: 'Chemicals', icon: 'flask', color: '#4D96FF' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Fetch categories from backend
    console.log('Dashboard loaded', { user });
  }, [user]);

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/category-items',
      params: { categoryName },
    });
  };

  return (
    <UserGuard>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome</Text>
            <Text style={styles.subGreeting}>{user?.userId || 'Your Shop'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-circle-outline" size={40} color="#2B5D45" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {activeTab === 'category' && (
            <>
              <Text style={styles.sectionTitle}>All Categories</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { borderLeftColor: category.color }]}
                    onPress={() => handleCategoryPress(category.name)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon as any} size={32} color="#fff" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {activeTab === 'buyagain' && (
            <>
              <Text style={styles.sectionTitle}>Buy Again</Text>
              <View style={styles.emptyState}>
                <Ionicons name="refresh-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No recent purchases</Text>
              </View>
            </>
          )}

          {activeTab === 'deals' && (
            <>
              <Text style={styles.sectionTitle}>Special Deals</Text>
              <View style={styles.emptyState}>
                <Ionicons name="pricetag-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Check back soon for deals!</Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'home' && styles.activeNav]}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons
              name="home-outline"
              size={24}
              color={activeTab === 'home' ? '#2B5D45' : '#999'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'home' && styles.activeNavLabel,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'category' && styles.activeNav]}
            onPress={() => setActiveTab('category')}
          >
            <Ionicons
              name="grid-outline"
              size={24}
              color={activeTab === 'category' ? '#2B5D45' : '#999'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'category' && styles.activeNavLabel,
              ]}
            >
              Category
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'buyagain' && styles.activeNav]}
            onPress={() => setActiveTab('buyagain')}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={activeTab === 'buyagain' ? '#2B5D45' : '#999'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'buyagain' && styles.activeNavLabel,
              ]}
            >
              Buy Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'deals' && styles.activeNav]}
            onPress={() => setActiveTab('deals')}
          >
            <Ionicons
              name="pricetag-outline"
              size={24}
              color={activeTab === 'deals' ? '#2B5D45' : '#999'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'deals' && styles.activeNavLabel,
              ]}
            >
              Deals
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </UserGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F2ED',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DEC8',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2F2A1E',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6D6353',
    marginTop: 4,
    fontWeight: '600',
  },
  profileIcon: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F2A1E',
    marginBottom: 16,
    marginTop: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2A1E',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F2A1E',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DEC8',
    paddingBottom: 12,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  activeNav: {
    borderTopWidth: 3,
    borderTopColor: '#2B5D45',
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontWeight: '600',
  },
  activeNavLabel: {
    color: '#2B5D45',
  },
});
