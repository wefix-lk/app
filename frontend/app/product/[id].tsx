import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { mockProducts } from '../../data/mockProducts';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      console.log('🔍 Looking for product with ID:', id);
      
      // First, check mock products
      let foundProduct = mockProducts.find((p) => p.id === id);
      
      // If not found in mock products, check admin products
      if (!foundProduct) {
        const adminProductsJson = await AsyncStorage.getItem('admin_products');
        if (adminProductsJson) {
          const adminProducts = JSON.parse(adminProductsJson);
          foundProduct = adminProducts.find((p: any) => p.id === id);
          
          // Transform admin product to match expected format
          if (foundProduct) {
            foundProduct = {
              id: foundProduct.id,
              name: foundProduct.name,
              category: foundProduct.category,
              price: foundProduct.price,
              images: foundProduct.images && foundProduct.images.length > 0 
                ? foundProduct.images 
                : ['https://via.placeholder.com/300'],
              isInStock: (foundProduct.stock || 0) > 0,
              stock: foundProduct.stock || 0,
              description: foundProduct.description || 'No description available.',
              modelNumber: foundProduct.modelNumber || '',
            };
            console.log('✅ Found product in admin products:', foundProduct.name);
          }
        }
      } else {
        console.log('✅ Found product in mock products:', foundProduct.name);
      }
      
      setProduct(foundProduct);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading product:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Product Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Product Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={Colors.textLight} />
          <Text style={styles.errorTitle}>Product Not Available</Text>
          <Text style={styles.errorText}>
            This product data is not available. {'\n'}
            Please refresh or try again.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setLoading(true);
              loadProduct();
            }}
          >
            <Ionicons name="refresh" size={20} color={Colors.textWhite} />
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    Alert.alert('Added to Cart', `${quantity}x ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    Alert.alert(
      'Buy Now',
      `Proceed to checkout with ${quantity}x ${product.name}?\n\nTotal: LKR ${(product.price * quantity).toLocaleString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => openWhatsApp(),
        },
      ]
    );
  };

  const openWhatsApp = async () => {
    const whatsappNumber = '94773300905'; // +94 77 330 0905
    
    const message = `Hello WeFix.lk 👋,\n\nI'd like to buy the following product:\n\n- Product Name: ${product.name}\n- Quantity: ${quantity}\n- Total: LKR ${(product.price * quantity).toLocaleString()}\n\nPlease confirm availability.`;
    
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
        <Text style={styles.title}>Product Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          {product.isInStock ? (
            <View style={styles.stockBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.stockText}>In Stock</Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, { backgroundColor: Colors.error + '20' }]}>
              <Ionicons name="close-circle" size={16} color={Colors.error} />
              <Text style={[styles.stockText, { color: Colors.error }]}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>LKR {product.price.toLocaleString()}</Text>
            <View style={styles.stockInfo}>
              <Ionicons name="cube" size={16} color={Colors.textLight} />
              <Text style={styles.stockCount}>{product.stock} available</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <FeatureItem icon="checkmark-circle" text="Original Part - 100% Genuine" />
          <FeatureItem icon="checkmark-circle" text="1 Year Warranty Included" />
          <FeatureItem icon="checkmark-circle" text="Free Installation Support" />
          <FeatureItem icon="checkmark-circle" text="Cash on Delivery Available" />
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              <Ionicons name="add" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>Call: +94 77 123 4567</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="logo-whatsapp" size={20} color={Colors.secondary} />
            <Text style={styles.contactText}>WhatsApp Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addToCartButton, !product.isInStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!product.isInStock}
        >
          <Ionicons name="cart" size={20} color={Colors.primary} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyNowButton, !product.isInStock && styles.disabledButton]}
          onPress={handleBuyNow}
          disabled={!product.isInStock}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color={Colors.secondary} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: Colors.backgroundGray,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  stockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.success + '20',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  category: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockCount: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 24,
  },
  contactSection: {
    padding: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});
