import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { api, PRODUCTION_MODE } from '../services/api';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartSummary: CartSummary | null;
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from API or storage on mount
  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  // Save cart to local storage (demo mode only)
  useEffect(() => {
    if (!PRODUCTION_MODE) {
      saveCartLocal();
    }
  }, [cartItems]);

  const loadCart = async () => {
    try {
      setLoading(true);
      console.log('🛒 Loading cart...');
      console.log('🌐 Using:', PRODUCTION_MODE ? 'Production API' : 'Demo Mode');
      
      if (PRODUCTION_MODE && user) {
        // Production API mode
        const response = await api.cart.get();
        
        if (response.success && response.data) {
          const items = response.data.items || [];
          const summary = response.data.summary || null;
          
          // Transform API cart items to match app format
          const transformedItems = items.map((item: any) => {
            let imageUrl = item.product?.images?.[0] || item.image || '';
            
            // Construct full image URL if it's not already a full URL
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://wefixservers.xyz/assets/images/products/${imageUrl}`;
            }
            
            return {
              id: item.id,
              productId: item.productId || item.product_id,
              name: item.product?.name || item.name || 'Product',
              price: parseFloat(item.price) || 0,
              image: imageUrl,
              quantity: item.quantity || 1,
              category: item.product?.category || item.category || 'Uncategorized',
            };
          });
          
          setCartItems(transformedItems);
          setCartSummary(summary);
          console.log('✅ Loaded', transformedItems.length, 'cart items from API');
        } else {
          setCartItems([]);
          setCartSummary(null);
        }
      } else {
        // Demo mode - load from AsyncStorage
        const cartJson = await AsyncStorage.getItem('shopping_cart');
        if (cartJson) {
          const cart = JSON.parse(cartJson);
          setCartItems(cart);
          console.log('🛒 Loaded cart:', cart.length, 'items from local storage');
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading cart:', error);
      setCartItems([]);
      setCartSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const saveCartLocal = async () => {
    try {
      await AsyncStorage.setItem('shopping_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('❌ Error saving cart locally:', error);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    try {
      setLoading(true);
      
      if (PRODUCTION_MODE && user) {
        // Production API mode
        let productId = item.productId || item.id;
        
        // Strip "product_" prefix if present to get numeric ID
        if (typeof productId === 'string' && productId.startsWith('product_')) {
          productId = productId.replace('product_', '');
        }
        
        console.log('Adding to cart:', { productId, quantity, originalId: item.id });
        
        const response = await api.cart.addItem(productId, quantity);
        
        if (response.success) {
          // Reload cart to get updated data
          await loadCart();
          Alert.alert('Added to Cart', `${item.name} has been added to your cart!`, [
            { text: 'OK' }
          ]);
        } else {
          throw new Error(response.message || 'Failed to add item to cart');
        }
      } else {
        // Demo mode - update local state
        setCartItems((prevItems) => {
          const existingItem = prevItems.find((i) => i.id === item.id);
          
          if (existingItem) {
            // Update quantity if item already exists
            return prevItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            // Add new item with specified quantity
            return [...prevItems, { ...item, quantity }];
          }
        });
        
        Alert.alert('Added to Cart', `${item.name} has been added to your cart!`, [
          { text: 'OK' }
        ]);
      }
    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      setLoading(true);
      
      if (PRODUCTION_MODE && user) {
        // Production API mode - strip cart_item_ prefix if present
        let itemId = id;
        if (typeof itemId === 'string' && itemId.startsWith('cart_item_')) {
          itemId = itemId.replace('cart_item_', '');
        }
        
        console.log('Removing from cart:', { originalId: id, itemId });
        const response = await api.cart.removeItem(itemId);
        
        if (response.success) {
          // Reload cart to get updated data
          await loadCart();
        } else {
          throw new Error(response.message || 'Failed to remove item');
        }
      } else {
        // Demo mode - update local state
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      }
    } catch (error: any) {
      console.error('❌ Error removing from cart:', error);
      Alert.alert('Error', error.message || 'Failed to remove item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    
    try {
      setLoading(true);
      
      if (PRODUCTION_MODE && user) {
        // Production API mode - strip cart_item_ prefix if present
        let itemId = id;
        if (typeof itemId === 'string' && itemId.startsWith('cart_item_')) {
          itemId = itemId.replace('cart_item_', '');
        }
        
        console.log('Updating cart item quantity:', { originalId: id, itemId, quantity });
        const response = await api.cart.updateItem(itemId, quantity);
        
        if (response.success) {
          // Reload cart to get updated data
          await loadCart();
        } else {
          throw new Error(response.message || 'Failed to update quantity');
        }
      } else {
        // Demo mode - update local state
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      }
    } catch (error: any) {
      console.error('❌ Error updating quantity:', error);
      Alert.alert('Error', error.message || 'Failed to update quantity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('🗑️ Clearing cart...');
              
              if (PRODUCTION_MODE && user) {
                // Production API mode
                const response = await api.cart.clear();
                
                if (response.success) {
                  setCartItems([]);
                  setCartSummary(null);
                  console.log('✅ Cart cleared successfully');
                } else {
                  throw new Error(response.message || 'Failed to clear cart');
                }
              } else {
                // Demo mode - clear local state
                setCartItems([]);
                console.log('✅ Cart cleared (demo mode)');
              }
            } catch (error: any) {
              console.error('❌ Error clearing cart:', error);
              Alert.alert('Error', error.message || 'Failed to clear cart. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getCartTotal = () => {
    // Use cart summary if available (from API), otherwise calculate from items
    if (cartSummary) {
      return cartSummary.total;
    }
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    // Use cart summary if available (from API), otherwise calculate from items
    if (cartSummary) {
      return cartSummary.itemCount;
    }
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
