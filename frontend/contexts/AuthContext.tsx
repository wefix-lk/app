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
const ADMIN_EMAIL = 'wefixtvrepair@gmail.com';
const ADMIN_PASSWORD = 'swift@123';

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
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // Check for admin credentials first
      if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        console.log('🔐 Admin login detected');
        const adminProfile: UserProfile = {
          id: 'admin_001',
          uid: 'admin_001',
          email: ADMIN_EMAIL,
          name: 'WeFix Admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('user_profile', JSON.stringify(adminProfile));
        await AsyncStorage.setItem('auth_token', 'admin_token');
        await AsyncStorage.setItem('isAdmin', 'true');
        
        setUser({ uid: 'admin_001', email: ADMIN_EMAIL });
        setUserProfile(adminProfile);
        setIsAdmin(true);
        return;
      }

      // Production API login
      if (PRODUCTION_MODE) {
        const response = await api.auth.login({
          email,
          password
        });
        
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
          
          console.log('✅ Login successful (Production):', userData.email);
        }
      } else {
        // Demo mode - AsyncStorage fallback
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
          await AsyncStorage.setItem('userToken', storedUser.uid);
          await AsyncStorage.removeItem('isAdmin');
          
          setUser({ uid: storedUser.uid, email: storedUser.email });
          setUserProfile(userProfile);
          setIsAdmin(false);
        } else {
          throw new Error('Invalid email or password. Please check your credentials or create a new account.');
        }
      } else {
        // Firebase mode
        const result = await signInWithEmailAndPassword(auth, email, password);
        await AsyncStorage.setItem('userToken', result.user.uid);
        await AsyncStorage.removeItem('isAdmin');
        setIsAdmin(false);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to sign in. Please try again.');
      }
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      if (isDemoMode) {
        // Local development mode - store user locally
        const usersJson = await AsyncStorage.getItem('local_users');
        const users = usersJson ? JSON.parse(usersJson) : {};
        
        // Check if user already exists
        if (users[email]) {
          throw new Error('An account with this email already exists. Please login instead.');
        }
        
        const uid = `local_${Date.now()}`;
        const userProfile: UserProfile = {
          uid,
          email,
          name,
          createdAt: new Date().toISOString()
        };
        
        // Store user with password
        users[email] = {
          ...userProfile,
          password
        };
        
        await AsyncStorage.setItem('local_users', JSON.stringify(users));
        await AsyncStorage.setItem('local_user', JSON.stringify(userProfile));
        await AsyncStorage.setItem('userToken', uid);
        
        setUser({ uid, email });
        setUserProfile(userProfile);
      } else {
        // Firebase mode
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user profile in Firestore
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: email,
          name: name,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        setUserProfile(userProfile);
        await AsyncStorage.setItem('userToken', result.user.uid);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check and try again.');
      } else {
        throw new Error(error.message || 'Failed to create account. Please try again.');
      }
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Starting sign out process...', { isDemoMode });
      
      if (isDemoMode) {
        console.log('📱 Demo mode: Clearing local storage');
        await AsyncStorage.removeItem('local_user');
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('isAdmin');
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        console.log('✅ Demo mode sign out complete');
      } else {
        console.log('🔥 Firebase mode: Signing out from Firebase');
        await firebaseSignOut(auth);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('isAdmin');
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        console.log('✅ Firebase sign out complete');
      }
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isDemoMode) {
        // In demo mode, check if email exists in local storage
        console.log('🔄 Password reset requested for:', email);
        const usersJson = await AsyncStorage.getItem('local_users');
        const users = usersJson ? JSON.parse(usersJson) : {};
        
        if (!users[email]) {
          console.log('❌ Email not found:', email);
          throw new Error('No account found with this email address.');
        }
        
        console.log('✅ Email found, simulating password reset email sent');
        // In production, Firebase will send the actual email
      } else {
        // Firebase mode
        await sendPasswordResetEmail(auth, email);
      }
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check and try again.');
      } else if (error.message) {
        throw error; // Re-throw our custom errors
      } else {
        throw new Error('Failed to send reset email. Please try again.');
      }
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      if (isDemoMode) {
        const updatedProfile = { ...userProfile, ...data } as UserProfile;
        await AsyncStorage.setItem('local_user', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      } else {
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        setUserProfile({ ...userProfile, ...data } as UserProfile);
      }
    } catch (error: any) {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
