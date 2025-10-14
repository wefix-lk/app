import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration
// For production: Replace these with your actual Firebase project credentials
// For development: Using demo mode with local storage fallback
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCL8jl4p3rYs1234567890abcdefghijk",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "wefix-lk-demo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "wefix-lk-demo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "wefix-lk-demo.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789012"
};

// Flag to indicate if we're using real Firebase or demo mode
export const isFirebaseConfigured = !!(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
);

// Initialize Firebase only if not already initialized
let app;
let auth;
let db;
let storage;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized:', isFirebaseConfigured ? 'Production Mode' : 'Demo Mode');
  } else {
    app = getApps()[0];
  }

  // Initialize Auth with AsyncStorage persistence for React Native
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }

  // Initialize Firestore
  db = getFirestore(app);

  // Initialize Storage
  storage = getStorage(app);
} catch (error) {
  console.warn('⚠️ Firebase initialization error:', error);
  console.log('📝 Running in local development mode');
}

export { auth, db, storage, app as default };
export { firebaseConfig };
