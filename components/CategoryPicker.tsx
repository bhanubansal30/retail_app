import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Category {
  id: string;
  name: string;
}

interface CategoryPickerProps {
  categories: Category[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  enabled?: boolean;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedValue,
  onValueChange,
  enabled = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedCategory = categories.find((c) => c.id === selectedValue);

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, !enabled && styles.pickerButtonDisabled]}
        onPress={() => enabled && setModalVisible(true)}
      >
        <Text
          style={[
            styles.pickerButtonText,
            !selectedValue && styles.placeholderText,
          ]}
        >
          {selectedCategory?.name || 'Select Category'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#95a5a6" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  selectedValue === item.id && styles.categoryOptionSelected,
                ]}
                onPress={() => {
                  onValueChange(item.id);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    selectedValue === item.id &&
                      styles.categoryOptionTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
                {selectedValue === item.id && (
                  <Ionicons name="checkmark" size={20} color="#2B5D45" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  placeholderText: {
    color: '#bdc3c7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  categoryOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  categoryOptionTextSelected: {
    fontWeight: '600',
    color: '#2B5D45',
  },
});
