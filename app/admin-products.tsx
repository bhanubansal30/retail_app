import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/utils/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.3.19:3000';
// const API_URL = "https://retail-app-siqh.onrender.com";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  mrp: number;
  stock: number;
  categoryId: string;
  categoryName?: string;
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch categories first
      const categoriesResponse = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const categoriesData = await categoriesResponse.json();

      if (!categoriesData.success) {
        throw new Error(categoriesData.message || 'Failed to fetch categories');
      }

      const categories = categoriesData.data || [];
      const categoryMap: Record<string, string> = {};
      categories.forEach((cat: any) => {
        categoryMap[cat.id] = cat.name;
      });

      // Fetch products for each category
      let allProducts: Product[] = [];

      for (const category of categories) {
        const response = await fetch(`${API_URL}/api/products/${category.id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success && data.data) {
          const productsWithCategory = data.data.map((product: any) => ({
            ...product,
            categoryName: categoryMap[product.categoryId],
          }));
          allProducts = [...allProducts, ...productsWithCategory];
        }
      }

      setProducts(allProducts);
    } catch (error: any) {
      console.error('Load products error:', error);
      Alert.alert('Error', error?.message || 'Failed to load products');
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
              const token = await getToken();
              
              if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
              }

              const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              const data = await response.json();

              if (!data.success) {
                throw new Error(data.message || 'Failed to delete product');
              }

              setProducts(products.filter(p => p.id !== id));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error: any) {
              console.error('Delete product error:', error);
              Alert.alert('Error', error?.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStock = (product: Product) => {
    const currentStock = product.stock ?? 0;
    Alert.prompt(
      'Update Stock',
      `Current stock: ${currentStock} units\n\nEnter new stock quantity:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          style: 'default',
          onPress: async (newStock) => {
            if (!newStock || isNaN(parseInt(newStock))) {
              Alert.alert('Error', 'Please enter a valid number');
              return;
            }

            try {
              const token = await getToken();
              
              if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
              }

              const response = await fetch(`${API_URL}/api/products/${product.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ stock: parseInt(newStock) }),
              });

              const data = await response.json();

              if (!data.success) {
                throw new Error(data.message || 'Failed to update stock');
              }

              const updatedProducts = products.map(p => 
                p.id === product.id ? { ...p, stock: parseInt(newStock) } : p
              );
              setProducts(updatedProducts);
              Alert.alert('Success', 'Stock updated successfully');
            } catch (error: any) {
              console.error('Update stock error:', error);
              Alert.alert('Error', error?.message || 'Failed to update stock');
            }
          },
        },
      ],
      'plain-text',
      currentStock.toString()
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const stock = item.stock ?? 0;
    return (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productCategory}>{item.categoryName}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
        </View>
        <View style={styles.mrpContainer}>
          <Text style={styles.mrpLabel}>MRP: </Text>
          <Text style={styles.mrpValue}>₹{item.mrp}</Text>
        </View>
        <View style={styles.stockContainer}>
          <Text style={[styles.stockBadge, stock > 20 ? styles.stockGood : stock > 0 ? styles.stockWarning : styles.stockCritical]}>
            Stock: {stock} units
          </Text>
        </View>
        {item.description && (
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.stockBtn}
          onPress={() => handleUpdateStock(item)}
        >
          <Ionicons name="layers" size={18} color="#f39c12" />
          <Text style={styles.stockBtnText}>{stock}</Text>
        </TouchableOpacity>
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
  };

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
  mrpContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  mrpLabel: {
    fontSize: 11,
    color: '#95a5a6',
  },
  mrpValue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#34495e',
  },
  stockContainer: {
    marginTop: 6,
  },
  stockBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  stockGood: {
    backgroundColor: '#d5f4e6',
    color: '#27ae60',
  },
  stockWarning: {
    backgroundColor: '#ffeaa7',
    color: '#d68910',
  },
  stockCritical: {
    backgroundColor: '#fadbd8',
    color: '#e74c3c',
  },
  description: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  stockBtn: {
    backgroundColor: '#fff3cd',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  stockBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f39c12',
  },
  actionBtn: {
    padding: 8,
  },
});
