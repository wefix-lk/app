import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { mockProducts } from '../../data/mockProducts';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function ShopScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState(mockProducts);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'TV Panels', label: 'TV Panels' },
    { id: 'Backlights', label: 'Backlights' },
    { id: 'T-CON Boards', label: 'T-CON Boards' },
    { id: 'TV Main Boards', label: 'TV Main Boards' },
    { id: 'Multi Products', label: 'Multi Products' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      // Load admin-added products
      const adminProductsJson = await AsyncStorage.getItem('admin_products');
      const adminProducts = adminProductsJson ? JSON.parse(adminProductsJson) : [];
      
      // Filter only active/visible products
      const visibleAdminProducts = adminProducts.filter((p: any) => p.isActive !== false);
      
      // Transform admin products to match the expected format
      const transformedAdminProducts = visibleAdminProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        images: p.images && p.images.length > 0 ? p.images : ['https://via.placeholder.com/300'],
        isInStock: (p.stock || 0) > 0,
        stock: p.stock || 0,
        description: p.description || '',
        modelNumber: p.modelNumber || '',
      }));

      // Combine mock products with admin products
      const combined = [...mockProducts, ...transformedAdminProducts];
      setAllProducts(combined);
      
      console.log('📦 Loaded products:', {
        mock: mockProducts.length,
        admin: transformedAdminProducts.length,
        total: combined.length
      });
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setAllProducts(mockProducts); // Fallback to mock products
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop Parts</Text>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => setShowSearchModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={20} color={Colors.textLight} />
        <Text style={styles.searchPlaceholder}>
          {selectedCategory === 'all' ? 'Search products...' : categories.find(c => c.id === selectedCategory)?.label || 'Search products...'}
        </Text>
      </TouchableOpacity>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesWrapper}
        contentContainerStyle={styles.categoriesContainer}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={styles.productRow}
        style={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <TouchableOpacity
              onPress={() => router.push(`/product/${item.id}`)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.images[0] }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>
                  LKR {item.price.toLocaleString()}
                </Text>
                <View style={styles.stockBadge}>
                  {item.isInStock ? (
                    <Text style={styles.inStockText}>In Stock</Text>
                  ) : (
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Add to Cart Button */}
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !item.isInStock && styles.addToCartButtonDisabled
              ]}
              onPress={() => {
                if (item.isInStock) {
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.images[0],
                    category: item.category,
                  });
                }
              }}
              disabled={!item.isInStock}
            >
              <Ionicons 
                name="cart" 
                size={16} 
                color={item.isInStock ? Colors.textWhite : Colors.textLight} 
              />
              <Text style={[
                styles.addToCartText,
                !item.isInStock && styles.addToCartTextDisabled
              ]}>
                {item.isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Category Selection Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category.id && styles.categoryOptionActive
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setShowSearchModal(false);
                  }}
                >
                  <Ionicons 
                    name={category.id === 'all' ? 'grid' : 'cube'} 
                    size={20} 
                    color={selectedCategory === category.id ? Colors.primary : Colors.textLight} 
                  />
                  <Text style={[
                    styles.categoryOptionText,
                    selectedCategory === category.id && styles.categoryOptionTextActive
                  ]}>
                    {category.label}
                  </Text>
                  {selectedCategory === category.id && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 0,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: Colors.textLight,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoriesWrapper: {
    backgroundColor: Colors.background,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    marginRight: 8,
    minWidth: 70,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 36,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  categoryTextActive: {
    color: Colors.textWhite,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
  },
  productsList: {
    flex: 1,
  },
  productsContainer: {
    padding: 16,
    paddingTop: 4,
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: cardWidth,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.backgroundGray,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    height: 36,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  stockBadge: {
    alignSelf: 'flex-start',
  },
  inStockText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  outOfStockText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalBody: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  categoryOptionActive: {
    backgroundColor: Colors.backgroundGray,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  categoryOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
