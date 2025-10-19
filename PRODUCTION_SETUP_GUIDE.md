# Production Setup Guide - WeFix.lk

## ✅ Configuration Complete

Your WeFix.lk app has been configured to use the production API server.

---

## 📋 Current Configuration

### **API Server**
- **URL:** `http://wefixservers.xyz/api`
- **Mode:** Production
- **Status:** Ready to use

### **Files Modified:**
1. ✅ `/app/frontend/.env` - Added production API URL
2. ✅ `/app/frontend/app.json` - Added extra config for API URL
3. ✅ `/app/frontend/services/api.ts` - Created API service layer

---

## 🔄 How to Use the API Service

### **Import the API Service**

```typescript
import { api } from '../services/api';
```

---

## 📝 Example Usage

### **1. Authentication**

**Register User:**
```typescript
import { api } from '../services/api';

const handleRegister = async () => {
  try {
    const response = await api.auth.register({
      name: 'Shadir Ahmed',
      email: 'shadir@example.com',
      phone: '+94771234567',
      password: 'securePassword123'
    });
    
    console.log('✅ Registration successful:', response);
    // Token is automatically saved to AsyncStorage
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    Alert.alert('Error', error.message);
  }
};
```

**Login User:**
```typescript
const handleLogin = async () => {
  try {
    const response = await api.auth.login({
      email: 'shadir@example.com',
      password: 'securePassword123'
    });
    
    console.log('✅ Login successful:', response.data.user);
    // Token is automatically saved
    
    // Navigate to home screen
    router.push('/(tabs)/home');
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    Alert.alert('Login Failed', error.message);
  }
};
```

**Logout User:**
```typescript
const handleLogout = async () => {
  try {
    await api.auth.logout();
    console.log('✅ Logout successful');
    
    // Navigate to login
    router.push('/(auth)/login');
    
  } catch (error) {
    console.error('❌ Logout failed:', error);
  }
};
```

---

### **2. User Profile**

**Get Profile:**
```typescript
const loadProfile = async () => {
  try {
    const response = await api.profile.get();
    console.log('✅ Profile loaded:', response.data);
    
    setUserProfile(response.data);
    
  } catch (error) {
    console.error('❌ Failed to load profile:', error);
  }
};
```

**Update Profile:**
```typescript
const updateProfile = async () => {
  try {
    const response = await api.profile.update({
      name: 'Updated Name',
      phone: '+94771234567',
      notificationPreferences: {
        email: true,
        push: false,
        sms: true
      }
    });
    
    console.log('✅ Profile updated:', response.data);
    Alert.alert('Success', 'Profile updated successfully');
    
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    Alert.alert('Error', error.message);
  }
};
```

---

### **3. Bookings**

**Create Booking:**
```typescript
const createBooking = async () => {
  try {
    const response = await api.bookings.create({
      tvBrand: 'Samsung',
      tvModel: 'UA55AU7700',
      issueType: 'display-issue',
      issueDescription: 'Screen has vertical lines',
      address: 'No. 123, Main Street, Colombo 03',
      phone: '+94771234567',
      pickupOption: 'pickup',
      customerName: 'Shadir Ahmed'
    });
    
    console.log('✅ Booking created:', response.data);
    Alert.alert('Success', 'Booking created successfully');
    
    router.push('/booking/success');
    
  } catch (error) {
    console.error('❌ Failed to create booking:', error);
    Alert.alert('Error', error.message);
  }
};
```

**Get User Bookings:**
```typescript
const loadBookings = async () => {
  try {
    const response = await api.bookings.getUserBookings({
      status: 'in-progress', // optional
      page: 1,
      limit: 10
    });
    
    console.log('✅ Bookings loaded:', response.data.bookings);
    setBookings(response.data.bookings);
    
  } catch (error) {
    console.error('❌ Failed to load bookings:', error);
  }
};
```

**Get Booking by ID:**
```typescript
const loadBookingDetails = async (bookingId: string) => {
  try {
    const response = await api.bookings.getById(bookingId);
    console.log('✅ Booking details:', response.data);
    
    setBookingDetails(response.data);
    
  } catch (error) {
    console.error('❌ Failed to load booking details:', error);
  }
};
```

**Cancel Booking:**
```typescript
const cancelBooking = async (bookingId: string) => {
  try {
    await api.bookings.cancel(bookingId, 'Changed my mind');
    console.log('✅ Booking cancelled');
    
    Alert.alert('Success', 'Booking cancelled successfully');
    loadBookings(); // Reload list
    
  } catch (error) {
    console.error('❌ Failed to cancel booking:', error);
    Alert.alert('Error', error.message);
  }
};
```

---

### **4. Products**

**Get All Products:**
```typescript
const loadProducts = async () => {
  try {
    const response = await api.products.getAll({
      category: 'TV Panels', // optional
      search: 'Samsung', // optional
      page: 1,
      limit: 20,
      inStock: true // optional
    });
    
    console.log('✅ Products loaded:', response.data.products);
    setProducts(response.data.products);
    
  } catch (error) {
    console.error('❌ Failed to load products:', error);
  }
};
```

**Get Product by ID:**
```typescript
const loadProductDetails = async (productId: string) => {
  try {
    const response = await api.products.getById(productId);
    console.log('✅ Product details:', response.data);
    
    setProduct(response.data);
    
  } catch (error) {
    console.error('❌ Failed to load product:', error);
    Alert.alert('Error', 'Product not found');
  }
};
```

---

### **5. Cart**

**Get Cart:**
```typescript
const loadCart = async () => {
  try {
    const response = await api.cart.get();
    console.log('✅ Cart loaded:', response.data);
    
    setCartItems(response.data.items);
    setCartSummary(response.data.summary);
    
  } catch (error) {
    console.error('❌ Failed to load cart:', error);
  }
};
```

**Add to Cart:**
```typescript
const addToCart = async (productId: string, quantity: number) => {
  try {
    const response = await api.cart.addItem(productId, quantity);
    console.log('✅ Item added to cart:', response.data);
    
    Alert.alert('Success', 'Item added to cart');
    loadCart(); // Reload cart
    
  } catch (error) {
    console.error('❌ Failed to add to cart:', error);
    Alert.alert('Error', error.message);
  }
};
```

**Update Cart Item:**
```typescript
const updateCartItem = async (itemId: string, quantity: number) => {
  try {
    await api.cart.updateItem(itemId, quantity);
    console.log('✅ Cart item updated');
    
    loadCart(); // Reload cart
    
  } catch (error) {
    console.error('❌ Failed to update cart:', error);
  }
};
```

**Remove from Cart:**
```typescript
const removeFromCart = async (itemId: string) => {
  try {
    await api.cart.removeItem(itemId);
    console.log('✅ Item removed from cart');
    
    loadCart(); // Reload cart
    
  } catch (error) {
    console.error('❌ Failed to remove from cart:', error);
  }
};
```

---

### **6. Addresses**

**Get Saved Addresses:**
```typescript
const loadAddresses = async () => {
  try {
    const response = await api.addresses.getAll();
    console.log('✅ Addresses loaded:', response.data.addresses);
    
    setAddresses(response.data.addresses);
    
  } catch (error) {
    console.error('❌ Failed to load addresses:', error);
  }
};
```

**Add Address:**
```typescript
const addAddress = async () => {
  try {
    const response = await api.addresses.add({
      label: 'Home',
      address: 'No. 123, Main Street, Colombo 03',
      isDefault: true
    });
    
    console.log('✅ Address added:', response.data);
    Alert.alert('Success', 'Address added successfully');
    
    loadAddresses(); // Reload list
    
  } catch (error) {
    console.error('❌ Failed to add address:', error);
    Alert.alert('Error', error.message);
  }
};
```

---

### **7. Warranty Check**

```typescript
const checkWarranty = async () => {
  try {
    const response = await api.warranty.check({
      serialNumber: 'SN123456789',
      billNumber: 'BILL-2024-001',
      phoneNumber: '+94771234567'
    });
    
    console.log('✅ Warranty check result:', response.data);
    
    if (response.data.isValid) {
      Alert.alert('Warranty Valid', `Expires on: ${response.data.expiryDate}`);
    } else {
      Alert.alert('Warranty Expired', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Warranty check failed:', error);
    Alert.alert('Error', 'No warranty found');
  }
};
```

---

### **8. OTP Verification**

**Send OTP:**
```typescript
const sendOTP = async (phone: string) => {
  try {
    const response = await api.otp.send(phone);
    console.log('✅ OTP sent:', response.data);
    
    Alert.alert('Success', 'OTP sent to your phone');
    
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
    Alert.alert('Error', error.message);
  }
};
```

**Verify OTP:**
```typescript
const verifyOTP = async (phone: string, otp: string) => {
  try {
    const response = await api.otp.verify(phone, otp);
    console.log('✅ OTP verified:', response.data);
    
    Alert.alert('Success', 'Phone number verified');
    setPhoneVerified(true);
    
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    Alert.alert('Error', 'Invalid or expired OTP');
  }
};
```

---

### **9. Admin - Get All Bookings**

```typescript
const loadAllBookings = async () => {
  try {
    const response = await api.admin.getAllBookings({
      status: 'pending', // optional
      page: 1,
      limit: 20,
      startDate: '2025-06-01',
      endDate: '2025-06-30'
    });
    
    console.log('✅ Admin bookings loaded:', response.data);
    setBookings(response.data.bookings);
    setStats(response.data.stats);
    
  } catch (error) {
    console.error('❌ Failed to load bookings:', error);
  }
};
```

---

## 🔒 Authentication Flow

### **How Tokens Work:**

1. **Login:**
   - User logs in
   - API returns JWT token
   - Token is automatically saved to AsyncStorage
   - Token is included in all future requests

2. **Protected Requests:**
   - All API requests automatically include the token
   - No need to manually add Authorization header

3. **Token Expiry:**
   - If token expires, API returns 401 error
   - Catch the error and redirect to login

**Example Error Handling:**
```typescript
try {
  const response = await api.bookings.getUserBookings();
  // ... handle success
} catch (error) {
  if (error.message.includes('Unauthorized') || error.message.includes('401')) {
    // Token expired or invalid
    Alert.alert('Session Expired', 'Please login again');
    router.push('/(auth)/login');
  } else {
    Alert.alert('Error', error.message);
  }
}
```

---

## 🚀 Migration from AsyncStorage to API

### **Before (AsyncStorage):**
```typescript
// Old code
const products = await AsyncStorage.getItem('products');
const parsedProducts = JSON.parse(products || '[]');
setProducts(parsedProducts);
```

### **After (API):**
```typescript
// New code
const response = await api.products.getAll();
setProducts(response.data.products);
```

---

## 📊 Error Handling Best Practices

### **Standard Error Handling Pattern:**
```typescript
const loadData = async () => {
  setLoading(true);
  
  try {
    const response = await api.products.getAll();
    
    if (response.success) {
      setProducts(response.data.products);
    }
    
  } catch (error) {
    console.error('Error loading data:', error);
    
    // Show user-friendly error message
    Alert.alert(
      'Error',
      error.message || 'Something went wrong. Please try again.'
    );
    
  } finally {
    setLoading(false);
  }
};
```

---

## 🔄 Refresh Pattern

### **Pull-to-Refresh:**
```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  
  try {
    await loadProducts();
  } catch (error) {
    console.error('Refresh error:', error);
  } finally {
    setRefreshing(false);
  }
};

// In your JSX:
<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Your content */}
</ScrollView>
```

---

## 🧪 Testing the API

### **1. Test API Connection:**
```typescript
import { API_URL, PRODUCTION_MODE } from '../services/api';

console.log('API URL:', API_URL);
console.log('Production Mode:', PRODUCTION_MODE);
```

### **2. Test Basic Endpoint:**
```typescript
const testAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    console.log('API Test successful:', data);
  } catch (error) {
    console.error('API Test failed:', error);
  }
};
```

---

## 📝 Important Notes

### **1. HTTPS vs HTTP:**
- Current API URL uses HTTP: `http://wefixservers.xyz/api`
- For production, recommend using HTTPS: `https://wefixservers.xyz/api`
- HTTPS provides encryption and security

### **2. Token Storage:**
- Tokens are stored in AsyncStorage
- Automatically included in all requests
- Cleared on logout

### **3. Error Messages:**
- API returns structured error messages
- Always show user-friendly messages
- Log full errors for debugging

### **4. Rate Limiting:**
- API has rate limits (100 req/min for standard endpoints)
- Handle rate limit errors gracefully
- Implement retry logic if needed

---

## 🔧 Troubleshooting

### **Issue: "Network request failed"**
**Solution:**
- Check internet connection
- Verify API URL is correct
- Test API server is running

### **Issue: "401 Unauthorized"**
**Solution:**
- User needs to login again
- Token expired or invalid
- Redirect to login screen

### **Issue: "404 Not Found"**
**Solution:**
- Check endpoint URL is correct
- Verify resource ID exists
- Check API documentation

### **Issue: "500 Internal Server Error"**
**Solution:**
- Server-side error
- Contact backend team
- Check server logs

---

## 📚 Next Steps

1. ✅ **Test API endpoints** - Use the examples above
2. ✅ **Replace AsyncStorage calls** - Migrate to API service
3. ✅ **Test authentication** - Register, login, logout
4. ✅ **Test bookings** - Create, view, cancel
5. ✅ **Test products** - Load products, view details
6. ✅ **Test cart** - Add, update, remove items
7. ✅ **Deploy to production** - Build and release app

---

## 📞 Support

For API issues, contact:
- **Backend Team:** backend@wefix.lk
- **API URL:** http://wefixservers.xyz/api
- **Documentation:** `/app/API_DOCUMENTATION.md`

---

**Configuration Complete! Your app is now ready to use the production API.** 🎉
