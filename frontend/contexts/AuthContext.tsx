import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, PRODUCTION_MODE } from '../services/api';

interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  phoneVerified?: boolean;
  address?: string;
  role?: string;
  createdAt: string;
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isDemoMode: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin credentials (hard-coded for MVP)
const ADMIN_ACCOUNTS = [
  {
    email: 'wefixtvrepair@gmail.com',
    password: 'swift@123',
    phone: null,
    id: 'admin_001',
    name: 'WeFix Admin (Email)',
  },
  {
    email: null,
    password: 'swift@123',
    phone: '+94757000028',
    id: 'admin_002',
    name: 'WeFix Admin (Phone)',
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode] = useState(!PRODUCTION_MODE);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_profile');
      const adminFlag = await AsyncStorage.getItem('isAdmin');
      
      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser({ uid: userData.id || userData.uid, email: userData.email });
        setUserProfile(userData);
        setIsAdmin(adminFlag === 'true' || userData.role === 'admin');
        console.log('👤 Restored session:', userData.email, adminFlag === 'true' || userData.role === 'admin' ? '(Admin)' : '(User)');
        console.log('🌐 Production Mode:', PRODUCTION_MODE ? 'LIVE API' : 'Demo Mode');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const signIn = async (phoneOrEmail: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', phoneOrEmail);
      console.log('🌐 Using:', PRODUCTION_MODE ? 'Production API' : 'Demo Mode');
      
      // Check for admin credentials (support both email and phone)
      const adminAccount = ADMIN_ACCOUNTS.find(admin => {
        if (admin.email && phoneOrEmail.toLowerCase() === admin.email.toLowerCase()) {
          return admin.password === password;
        }
        if (admin.phone && phoneOrEmail === admin.phone) {
          return admin.password === password;
        }
        return false;
      });

      if (adminAccount) {
        console.log('🔐 Admin login detected:', adminAccount.name);
        const adminProfile: UserProfile = {
          id: adminAccount.id,
          uid: adminAccount.id,
          email: adminAccount.email || `${adminAccount.id}@wefix.lk`,
          name: adminAccount.name,
          phone: adminAccount.phone || undefined,
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('user_profile', JSON.stringify(adminProfile));
        await AsyncStorage.setItem('auth_token', `${adminAccount.id}_token`);
        await AsyncStorage.setItem('isAdmin', 'true');
        
        setUser({ uid: adminAccount.id, email: adminProfile.email });
        setUserProfile(adminProfile);
        setIsAdmin(true);
        return;
      }

      // Production API login
      if (PRODUCTION_MODE) {
        console.log('🌐 Calling production API login...');
        
        // Check if it's a phone number (starts with +) or email (contains @)
        const isPhone = phoneOrEmail.startsWith('+');
        const loginData = isPhone 
          ? { phone: phoneOrEmail, password }
          : { email: phoneOrEmail, password };
        
        const response = await api.auth.login(loginData);
        
        if (response.success && response.data) {
          const userData = response.data.user;
          const userProfile: UserProfile = {
            id: userData.id,
            uid: userData.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            phoneVerified: userData.phoneVerified,
            role: userData.role,
            createdAt: userData.createdAt,
            notificationPreferences: userData.notificationPreferences
          };
          
          await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
          await AsyncStorage.setItem('isAdmin', userData.role === 'admin' ? 'true' : 'false');
          
          setUser({ uid: userData.id, email: userData.email });
          setUserProfile(userProfile);
          setIsAdmin(userData.role === 'admin');
          
          console.log('✅ Login successful (Production API):', userData.phone || userData.email);
        }
      } else {
        // Demo mode - AsyncStorage fallback
        console.log('🌐 Using demo mode login...');
        const usersJson = await AsyncStorage.getItem('local_users');
        const users = usersJson ? JSON.parse(usersJson) : {};
        
        const storedUser = users[email];
        if (storedUser && storedUser.password === password) {
          const userProfile: UserProfile = {
            id: storedUser.uid,
            uid: storedUser.uid,
            email: storedUser.email,
            name: storedUser.name,
            createdAt: storedUser.createdAt
          };
          
          await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
          await AsyncStorage.setItem('auth_token', storedUser.uid);
          await AsyncStorage.setItem('isAdmin', 'false');
          
          setUser({ uid: storedUser.uid, email: storedUser.email });
          setUserProfile(userProfile);
          setIsAdmin(false);
          
          console.log('✅ Login successful (Demo):', storedUser.email);
        } else {
          throw new Error('Invalid email or password');
        }
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      console.log('🔐 Attempting registration for:', email);
      console.log('🌐 Using:', PRODUCTION_MODE ? 'Production API' : 'Demo Mode');

      if (PRODUCTION_MODE) {
        console.log('🌐 Calling production API register...');
        const response = await api.auth.register({
          name,
          email,
          phone: phone || '',
          password
        });
        
        if (response.success && response.data) {
          console.log('✅ Registration successful (Production API):', email);
          // Don't auto-login, let user login manually
        }
      } else {
        // Demo mode - store locally
        const usersJson = await AsyncStorage.getItem('local_users');
        const users = usersJson ? JSON.parse(usersJson) : {};
        
        if (users[email]) {
          throw new Error('An account with this email already exists. Please login instead.');
        }
        
        const uid = `local_${Date.now()}`;
        const userProfile: UserProfile = {
          id: uid,
          uid,
          email,
          name,
          phone,
          createdAt: new Date().toISOString()
        };
        
        users[email] = {
          ...userProfile,
          password
        };
        
        await AsyncStorage.setItem('local_users', JSON.stringify(users));
        console.log('✅ Registration successful (Demo):', email);
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Starting sign out...');
      
      if (PRODUCTION_MODE) {
        try {
          await api.auth.logout();
        } catch (error) {
          console.warn('API logout failed, clearing local data anyway');
        }
      }
      
      await AsyncStorage.removeItem('user_profile');
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('isAdmin');
      
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      console.log('✅ Sign out complete');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Password reset requested for:', email);
      
      if (PRODUCTION_MODE) {
        await api.auth.forgotPassword(email);
        console.log('✅ Password reset email sent (Production)');
      } else {
        // Demo mode - just check if email exists
        const usersJson = await AsyncStorage.getItem('local_users');
        const users = usersJson ? JSON.parse(usersJson) : {};
        
        if (!users[email]) {
          throw new Error('No account found with this email address.');
        }
        
        console.log('✅ Email found (Demo mode simulation)');
      }
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      console.log('🔄 Updating profile...');
      
      if (PRODUCTION_MODE) {
        await api.profile.update(data);
        const updatedProfile = { ...userProfile, ...data } as UserProfile;
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        console.log('✅ Profile updated (Production)');
      } else {
        const updatedProfile = { ...userProfile, ...data } as UserProfile;
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        console.log('✅ Profile updated (Demo)');
      }
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    isDemoMode,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
