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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';
import { api, PRODUCTION_MODE } from '../../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function ShopScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'TV Panels', label: 'TV Panels' },
    { id: 'Backlights', label: 'Backlights' },
    { id: 'T-CON Board', label: 'T-CON Board' },
    { id: 'TV Main Board', label: 'TV Main Board' },
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
      setLoading(true);
      setError(null);
      
      console.log('📥 Loading products...');
      console.log('🌐 Using:', PRODUCTION_MODE ? 'Production API' : 'Demo Mode');
      
      if (PRODUCTION_MODE) {
        // Production API mode - fetch from server
        const response = await api.products.getAll({
          limit: 100, // Get all products
        });
        
        if (response.success && response.data) {
          const products = response.data.products || [];
          
          // Transform API products to match app format
          const transformedProducts = products.map((p: any) => ({
            id: p.id,
            name: p.pro_name,
            category: p.category?.name || p.category || 'Uncategorized',
            price: parseFloat(p.price) || 0,
            cost: parseFloat(p.cost) || 0,
            images: p.pro_image ? [p.pro_image] : ['https://via.placeholder.com/300'],
            isInStock: (p.qty || 0) > 0,
            stock: p.qty || 0,
            description: p.description || '',
            modelNumber: p.sku || '',
            sku: p.sku,
            posCode: p.pos_code,
            supplier: p.supplier,
          }));
          
          setAllProducts(transformedProducts);
          console.log('✅ Loaded', transformedProducts.length, 'products from API');
        } else {
          console.log('ℹ️ No products found in API');
          setAllProducts([]);
        }
      } else {
        // Demo mode - load from AsyncStorage
        const adminProductsJson = await AsyncStorage.getItem('admin_products');
        const adminProducts = adminProductsJson ? JSON.parse(adminProductsJson) : [];
        
        const visibleAdminProducts = adminProducts.filter((p: any) => p.isActive !== false);
        
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

        setAllProducts(transformedAdminProducts);
        console.log('✅ Loaded', transformedAdminProducts.length, 'products from local storage');
      }
    } catch (error: any) {
      console.error('❌ Error loading products:', error);
      setError(error.message || 'Failed to load products');
      setAllProducts([]);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleBuyNow = async (product: any) => {
    const whatsappNumber = '94773300905'; // +94 77 330 0905
    
    const message = `Hello WeFix.lk, I would like to purchase the following item(s):\n\n1. ${product.name} – LKR ${product.price.toLocaleString()}\n\nTotal: LKR ${product.price.toLocaleString()}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    console.log('📱 Buy Now - Opening WhatsApp:', whatsappUrl);

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp Not Available',
          'WhatsApp is not installed on this device. Please install WhatsApp to continue.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error opening WhatsApp:', error);
      Alert.alert(
        'Error',
        'Could not open WhatsApp. Please make sure WhatsApp is installed.',
        [{ text: 'OK' }]
      );
    }
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: 0, backgroundColor: Colors.backgroundGray }]}>
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

      {/* Loading State */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Products</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cube-outline" size={60} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyText}>
            {selectedCategory === 'all' 
              ? 'No products available at the moment' 
              : `No products found in ${categories.find(c => c.id === selectedCategory)?.label}`}
          </Text>
        </View>
      ) : (
        /* Products Grid */
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
            
            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
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

              {/* Buy Now Button */}
              {item.isInStock && (
                <TouchableOpacity
                  style={styles.buyNowButton}
                  onPress={() => handleBuyNow(item)}
                >
                  <Ionicons name="logo-whatsapp" size={16} color={Colors.textWhite} />
                  <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
              )}
            </View>
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
    marginBottom: 6,
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
    backgroundColor: Colors.backgroundGray,
    marginTop: 6,
    marginBottom: 0,
    paddingBottom: 0,
    maxHeight: 50,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
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
    marginTop: 6,
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: Colors.backgroundGray,
    flex: 1,
  },
  addToCartText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  addToCartTextDisabled: {
    color: Colors.textLight,
  },
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  buyNowText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
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
