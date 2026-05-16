import { AdminGuard } from '@/components/AdminGuard';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useAuth } from '@/utils/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.3.19:3000';
// const API_URL = "https://retail-app-siqh.onrender.com";

export default function AddProductPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    mrp: '',
    stock: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Load categories error:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name.trim() || !formData.categoryId || !formData.price || !formData.mrp || !formData.stock) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: parseInt(formData.price),
          mrp: parseInt(formData.mrp),
          stock: parseInt(formData.stock),
          categoryId: formData.categoryId,
          description: formData.description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create product');
      }

      Alert.alert('Success', 'Product created successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/admin-products');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Create product error:', error);
      Alert.alert('Error', error?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#2B5D45" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Product Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                placeholderTextColor="#bdc3c7"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                editable={!loading}
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <CategoryPicker
                categories={categories}
                selectedValue={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
                enabled={!loading}
              />
            </View>

            {/* Price */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                placeholderTextColor="#bdc3c7"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* MRP */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>MRP (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter MRP (Maximum Retail Price)"
                placeholderTextColor="#bdc3c7"
                value={formData.mrp}
                onChangeText={(text) =>
                  setFormData({ ...formData, mrp: text })
                }
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Stock */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter stock quantity"
                placeholderTextColor="#bdc3c7"
                value={formData.stock}
                onChangeText={(text) =>
                  setFormData({ ...formData, stock: text })
                }
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter product description"
                placeholderTextColor="#bdc3c7"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleAddProduct}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.submitBtnText}>Creating...</Text>
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Create Product</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingVertical: 20,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#2B5D45',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
});
