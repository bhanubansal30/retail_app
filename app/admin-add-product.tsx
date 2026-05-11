import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Picker,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/utils/authContext';
import { AdminGuard } from '@/components/AdminGuard';
import { Ionicons } from '@expo/vector-icons';

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    description: '',
  });

  useEffect(() => {
    // TODO: Fetch categories from API
    setCategories([
      { id: '1', name: 'Kirana' },
      { id: '2', name: 'Confectionery' },
    ]);
  }, []);

  const handleAddProduct = async () => {
    if (!formData.name.trim() || !formData.categoryId || !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      // TODO: Call API to create product
      console.log('Creating product:', formData);
      
      Alert.alert('Success', 'Product created successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/admin-products');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create product');
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
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  enabled={!loading}
                >
                  <Picker.Item label="Select Category" value="" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                  ))}
                </Picker>
              </View>
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    overflow: 'hidden',
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
