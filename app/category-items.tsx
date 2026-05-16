import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  price: number;
  mrp: number;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function CategoryItemsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = Array.isArray(params.categoryId) 
    ? params.categoryId[0] 
    : params.categoryId;
  const categoryName = Array.isArray(params.categoryName)
    ? params.categoryName[0]
    : params.categoryName;
    
  const [items, setItems] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [categoryId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for categoryId:', categoryId);
      
      const response = await fetch(`${API_URL}/api/products/${categoryId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setItems(data.data || []);
      console.log('Products loaded:', data.data?.length || 0);
      
      if ((data.data || []).length === 0) {
        Alert.alert('No Products', `No products found for ${categoryName}`);
      }
    } catch (error: any) {
      console.error('Load products error:', error);
      Alert.alert('Error', error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: Product) => {
    const existingItem = cart.find((ci) => ci.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((ci) => ci.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((ci) =>
          ci.id === itemId ? { ...ci, quantity } : ci
        )
      );
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMRP = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = totalMRP - totalPrice;

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemIconContainer}>
        <Ionicons name="cube" size={32} color="#2B5D45" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addToCart(item)}
      >
        <Ionicons name="add-circle" size={32} color="#2B5D45" />
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemCard}>
      <View style={styles.cartItemIconContainer}>
        <Ionicons name="cube" size={24} color="#2B5D45" />
      </View>
      <View style={styles.cartItemContent}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price} x {item.quantity}</Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
          <Ionicons name="remove-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
          <Ionicons name="add-circle" size={24} color="#2B5D45" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#2B5D45" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2B5D45" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#2B5D45" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <TouchableOpacity
          onPress={() => setShowCart(!showCart)}
          style={styles.cartBadge}
        >
          <Ionicons name="cart-outline" size={24} color="#2B5D45" />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {showCart ? (
        cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Cart is empty</Text>
          </View>
        ) : (
          <View style={styles.cartContainer}>
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cartListContent}
              scrollEnabled={true}
            />

            {/* Cart Summary */}
            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>₹{totalPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>MRP:</Text>
                <Text style={styles.summaryValue}>₹{totalMRP.toFixed(2)}</Text>
              </View>
              {savings > 0 && (
                <View style={[styles.summaryRow, styles.savingsRow]}>
                  <Text style={styles.savingsLabel}>Savings:</Text>
                  <Text style={styles.savingsValue}>₹{savings.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => {
                  router.push({
                    pathname: '/checkout',
                    params: {
                      cartData: JSON.stringify(cart),
                      totalPrice: totalPrice.toString(),
                      totalMRP: totalMRP.toString(),
                    },
                  });
                }}
              >
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products in this category</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}

      {/* Floating Cart Summary (when not showing cart) */}
      {!showCart && cart.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => setShowCart(true)}
        >
          <View>
            <Text style={styles.floatingCartItems}>
              {totalItems} items
            </Text>
            <Text style={styles.floatingCartPrice}>
              ₹{totalPrice.toFixed(2)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DEC8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2F2A1E',
  },
  cartBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F4F2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F2A1E',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B5D45',
  },
  mrp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addButton: {
    padding: 4,
  },
  // Cart styles
  cartContainer: {
    flex: 1,
  },
  cartListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F4F2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cartItemContent: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2A1E',
    marginBottom: 3,
  },
  cartItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2B5D45',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2A1E',
    minWidth: 20,
    textAlign: 'center',
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DEC8',
    padding: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D6353',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2A1E',
  },
  savingsRow: {
    backgroundColor: '#F4F2ED',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  savingsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  savingsValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8DEC8',
    marginVertical: 8,
  },
  totalRow: {
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F2A1E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B5D45',
  },
  checkoutButton: {
    backgroundColor: '#2B5D45',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2B5D45',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#2B5D45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingCartItems: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  floatingCartPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
});
