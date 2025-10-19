import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get API URL from environment
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://wefixservers.xyz/api';

const PRODUCTION_MODE = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRODUCTION_MODE || 
                        process.env.EXPO_PUBLIC_PRODUCTION_MODE === 'true';

console.log('🌐 API Configuration:', {
  API_URL,
  PRODUCTION_MODE,
  mode: PRODUCTION_MODE ? 'Production' : 'Development'
});

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`, data);
      throw new Error(data.message || 'API request failed');
    }

    console.log(`✅ API Success: ${options.method || 'GET'} ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ API Request Failed: ${endpoint}`, error);
    throw error;
  }
};

// API Service
export const api = {
  // Authentication
  auth: {
    register: async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login: async (data: { email: string; password: string }) => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Save token to AsyncStorage
      if (response.data?.token) {
        await AsyncStorage.setItem('auth_token', response.data.token);
      }
      
      return response;
    },

    logout: async () => {
      await AsyncStorage.removeItem('auth_token');
      return apiRequest('/auth/logout', { method: 'POST' });
    },

    forgotPassword: async (email: string) => {
      return apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    resetPassword: async (token: string, newPassword: string) => {
      return apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    },
  },

  // User Profile
  profile: {
    get: async () => {
      return apiRequest('/users/profile');
    },

    update: async (data: any) => {
      return apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      return apiRequest('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
  },

  // Bookings
  bookings: {
    create: async (data: any) => {
      return apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getUserBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams(params as any).toString();
      return apiRequest(`/bookings/user${queryParams ? `?${queryParams}` : ''}`);
    },

    getById: async (bookingId: string) => {
      return apiRequest(`/bookings/${bookingId}`);
    },

    updateStatus: async (bookingId: string, status: string, note?: string) => {
      return apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      });
    },

    cancel: async (bookingId: string, reason: string) => {
      return apiRequest(`/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    },

    delete: async (bookingId: string) => {
      return apiRequest(`/bookings/${bookingId}`, {
        method: 'DELETE',
      });
    },
  },

  // Admin Bookings
  admin: {
    getAllBookings: async (params?: any) => {
      const queryParams = new URLSearchParams(params).toString();
      return apiRequest(`/admin/bookings${queryParams ? `?${queryParams}` : ''}`);
    },
  },

  // Products
  products: {
    getAll: async (params?: {
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
      inStock?: boolean;
    }) => {
      const queryParams = new URLSearchParams(params as any).toString();
      return apiRequest(`/products${queryParams ? `?${queryParams}` : ''}`);
    },

    getById: async (productId: string) => {
      return apiRequest(`/products/${productId}`);
    },

    create: async (formData: FormData) => {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return response.json();
    },

    update: async (productId: string, data: any) => {
      return apiRequest(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (productId: string) => {
      return apiRequest(`/admin/products/${productId}`, {
        method: 'DELETE',
      });
    },

    uploadImages: async (productId: string, formData: FormData) => {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/admin/products/${productId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return response.json();
    },
  },

  // Cart
  cart: {
    get: async () => {
      return apiRequest('/cart');
    },

    addItem: async (productId: string, quantity: number) => {
      return apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
    },

    updateItem: async (itemId: string, quantity: number) => {
      return apiRequest(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
    },

    removeItem: async (itemId: string) => {
      return apiRequest(`/cart/items/${itemId}`, {
        method: 'DELETE',
      });
    },

    clear: async () => {
      return apiRequest('/cart', {
        method: 'DELETE',
      });
    },
  },

  // Addresses
  addresses: {
    getAll: async () => {
      return apiRequest('/addresses');
    },

    add: async (data: { label: string; address: string; isDefault: boolean }) => {
      return apiRequest('/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (addressId: string, data: any) => {
      return apiRequest(`/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (addressId: string) => {
      return apiRequest(`/addresses/${addressId}`, {
        method: 'DELETE',
      });
    },

    setDefault: async (addressId: string) => {
      return apiRequest(`/addresses/${addressId}/default`, {
        method: 'PUT',
      });
    },
  },

  // Service Requests (Admin)
  serviceRequests: {
    getAll: async (params?: any) => {
      const queryParams = new URLSearchParams(params).toString();
      return apiRequest(`/admin/service-requests${queryParams ? `?${queryParams}` : ''}`);
    },

    update: async (requestId: string, data: any) => {
      return apiRequest(`/admin/service-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Warranty
  warranty: {
    check: async (data: {
      serialNumber: string;
      billNumber: string;
      phoneNumber: string;
    }) => {
      return apiRequest('/warranty/check', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Notifications
  notifications: {
    getAll: async (params?: { unread?: boolean; page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams(params as any).toString();
      return apiRequest(`/notifications${queryParams ? `?${queryParams}` : ''}`);
    },

    markAsRead: async (notificationId: string) => {
      return apiRequest(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    },

    markAllAsRead: async () => {
      return apiRequest('/notifications/read-all', {
        method: 'PUT',
      });
    },
  },

  // OTP Verification
  otp: {
    send: async (phone: string) => {
      return apiRequest('/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },

    verify: async (phone: string, otp: string) => {
      return apiRequest('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });
    },
  },
};

// Export API URL and production mode flag
export { API_URL, PRODUCTION_MODE };
