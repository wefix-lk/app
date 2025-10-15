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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { mockProducts } from '../../data/mockProducts';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function ShopScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState(mockProducts);
  const [refreshing, setRefreshing] = useState(false);

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
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => {
            Alert.alert(
              'Cart Coming Soon',
              'Shopping cart feature will be available in the next update!',
              [{ text: 'OK' }]
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="cart" size={24} color={Colors.text} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>0</Text>
          </View>
        </TouchableOpacity>
      </View>

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
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}`)}
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
        )}
      />
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
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
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
    paddingVertical: 12,
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
  productsContainer: {
    padding: 16,
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
    height: 150,
    backgroundColor: Colors.backgroundGray,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
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
});
