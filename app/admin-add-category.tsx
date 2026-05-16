import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/utils/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
//const API_URL = "https://retail-app-siqh.onrender.com";

export default function AddCategoryPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'cube',
  });

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      console.log('📤 Sending to:', `${API_URL}/api/categories`);
      console.log('🔐 Token:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          image: formData.image.trim() || undefined,
          icon: formData.icon,
        }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      
      console.log('📥 Response data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to create category');
      }

      Alert.alert('Success', 'Category created successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/admin-categories');
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ Add category error:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      
      let errorMsg = error?.message || 'Failed to create category';
      
      if (error?.message === 'Network request failed') {
        errorMsg = `Network error: Cannot reach ${API_URL}\n\nMake sure:\n1. Backend server is running\n2. IP address is correct\n3. Port 3000 is accessible`;
      }
      
      Alert.alert('Error', errorMsg);
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
          <Text style={styles.headerTitle}>Add Category</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Category Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                placeholderTextColor="#bdc3c7"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                editable={!loading}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter category description"
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

            {/* Image URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                placeholderTextColor="#bdc3c7"
                value={formData.image}
                onChangeText={(text) =>
                  setFormData({ ...formData, image: text })
                }
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleAddCategory}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.submitBtnText}>Creating...</Text>
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Create Category</Text>
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
