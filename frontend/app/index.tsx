import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

export default function Index() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      // Don't redirect if already on a valid route
      const inAuthGroup = segments[0] === '(auth)';
      const inTabsGroup = segments[0] === '(tabs)';
      const inAdminGroup = segments[0] === '(admin)';
      
      console.log('🔍 Current segments:', segments);
      console.log('👤 User:', user?.email, 'Admin:', isAdmin);
      
      if (user) {
        // User is logged in
        if (isAdmin) {
          // Admin user - only redirect if not already in admin or tabs
          if (!inAdminGroup && !inTabsGroup && segments.length <= 1) {
            console.log('🔐 Redirecting admin to dashboard');
            router.replace('/(admin)/dashboard');
          }
        } else {
          // Regular user - only redirect if not already in tabs
          if (!inTabsGroup && segments.length <= 1) {
            console.log('👤 Redirecting user to home');
            router.replace('/(tabs)/home');
          }
        }
      } else {
        // Not logged in - redirect to login
        if (!inAuthGroup) {
          console.log('🔓 Redirecting to login');
          router.replace('/(auth)/login');
        }
      }
    }
  }, [user, loading, isAdmin, segments]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
