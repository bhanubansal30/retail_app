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

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // TODO: Fetch products from API
      // For now, use mock data
      setProducts([
        {
          id: '1',
          name: 'Rice (1kg)',
          category: 'Kirana',
          price: 40,
          stock: 50,
          createdAt: '2026-01-01',
        },
        {
          id: '2',
          name: 'Sugar (1kg)',
          category: 'Kirana',
          price: 45,
          stock: 30,
          createdAt: '2026-01-02',
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call delete API
              setProducts(products.filter(p => p.id !== id));
              Alert.alert('Success', 'Product deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
        </View>
        <View style={styles.productStockContainer}>
          <Text style={styles.stockLabel}>Stock: </Text>
          <Text style={[styles.stockValue, item.stock > 0 ? styles.stockGood : styles.stockLow]}>
            {item.stock} units
          </Text>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            Alert.alert('Edit', 'Edit functionality coming soon');
          }}
        >
          <Ionicons name="pencil" size={18} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleDeleteProduct(item.id, item.name)}
        >
          <Ionicons name="trash" size={18} color="#e74c3c" />
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
          <Text style={styles.headerTitle}>Products</Text>
          <TouchableOpacity
            onPress={() => router.push('/admin-add-product')}
          >
            <Ionicons name="add-circle" size={28} color="#2B5D45" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2B5D45" />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No products yet</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => router.push('/admin-add-product')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
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
  addBtn: {
    flexDirection: 'row',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#2B5D45',
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  productCategory: {
    fontSize: 12,
    color: '#95a5a6',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  productStockContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  stockLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  stockValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockGood: {
    color: '#27ae60',
  },
  stockLow: {
    color: '#e74c3c',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
});
