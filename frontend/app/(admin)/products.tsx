import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface Product {
  id: string;
  name: string;
  modelNumber: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
  isActive: boolean;
}

// Predefined categories - MUST match customer panel exactly
const PRODUCT_CATEGORIES = [
  'TV Panels',
  'Backlights',
  'T-CON Board',
  'TV Main Board',
  'Multi Products',
];

export default function ManageProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  const loadProducts = async () => {
    try {
      const productsJson = await AsyncStorage.getItem('admin_products');
      const loadedProducts = productsJson ? JSON.parse(productsJson) : [];
      
      // Sort by creation date (newest first)
      loadedProducts.sort((a: Product, b: Product) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setProducts(loadedProducts);
      console.log('📦 Loaded products for management:', loadedProducts.length);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.modelNumber.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditModel(product.modelNumber);
    setEditCategory(product.category);
    setEditDescription(product.description || '');
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditImages(product.images || []);
    setShowEditModal(true);
  };

  const pickImage = async () => {
    if (editImages.length >= 4) {
      Alert.alert('Limit Reached', 'You can only upload up to 4 images per product.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setEditImages([...editImages, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const removeImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editName || !editModel || !editCategory || !editPrice || !editStock) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!editingProduct) return;

    setIsSaving(true);
    try {
      const updatedProducts = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: editName,
            modelNumber: editModel,
            category: editCategory,
            description: editDescription,
            price: parseFloat(editPrice),
            stock: parseInt(editStock, 10),
            images: editImages,
          };
        }
        return p;
      });

      await AsyncStorage.setItem('admin_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setShowEditModal(false);
      Alert.alert('Success', '✅ Product updated successfully!');
      console.log('✅ Product updated:', editingProduct.id);
    } catch (error) {
      console.error('❌ Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting product:', productToDelete.id);
      
      // Remove product from list
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('admin_products', JSON.stringify(updatedProducts));
      
      // Update local state
      setProducts(updatedProducts);
      
      // Close modal
      setShowDeleteModal(false);
      setProductToDelete(null);
      
      // Show success message
      Alert.alert('Success', '✅ Product deleted successfully and removed from customer panel!');
      
      console.log('✅ Product deleted successfully:', productToDelete.id);
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      Alert.alert('Error', '❌ Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Manage Products</Text>
          <Text style={styles.subtitle}>{filteredProducts.length} products</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, model, or category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Products List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No products found' : 'No products yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Add products from the dashboard'}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image 
                source={{ uri: product.images[0] || 'https://via.placeholder.com/100' }} 
                style={styles.productImage} 
              />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productModel}>Model: {product.modelNumber}</Text>
                <Text style={styles.productCategory}>📦 {product.category}</Text>
                <Text style={styles.productPrice}>LKR {product.price.toLocaleString()}</Text>
                <View style={styles.stockContainer}>
                  <Text style={styles.stockText}>
                    Stock: {product.stock} {product.stock > 0 ? '✅' : '❌'}
                  </Text>
                </View>
              </View>

              <View style={styles.productActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(product)}
                >
                  <Ionicons name="pencil" size={18} color={Colors.textWhite} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(product)}
                >
                  <Ionicons name="trash" size={18} color={Colors.textWhite} />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Product Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  value={editName}
                  onChangeText={setEditName}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Model Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter model number"
                  value={editModel}
                  onChangeText={setEditModel}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., TV Parts, Accessories"
                  value={editCategory}
                  onChangeText={setEditCategory}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Product description"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price (LKR) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Stock *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={editStock}
                    onChangeText={setEditStock}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Images (up to 4)</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Ionicons name="images" size={24} color={Colors.primary} />
                  <Text style={styles.imagePickerText}>Upload Image</Text>
                </TouchableOpacity>

                <View style={styles.imageGrid}>
                  {editImages.map((image, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image source={{ uri: image }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                onPress={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="warning" size={48} color={Colors.error} />
            </View>
            
            <Text style={styles.deleteModalTitle}>Delete Product?</Text>
            
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete "{productToDelete?.name}"?
              {'\n\n'}
              This action cannot be undone and will remove the product from both admin and customer panels.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmDeleteButton, isDeleting && styles.submitButtonDisabled]}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <>
                    <Ionicons name="trash" size={18} color={Colors.textWhite} />
                    <Text style={styles.confirmDeleteButtonText}>Yes, Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.text,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  productModel: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  stockContainer: {
    marginTop: 4,
  },
  stockText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  productActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    minWidth: 80,
  },
  editButton: {
    backgroundColor: Colors.info,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: Colors.textLight,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmDeleteButton: {
    backgroundColor: Colors.error,
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
});
