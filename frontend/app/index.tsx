import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

export default function Index() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on admin status
        if (isAdmin) {
          console.log('🔐 Redirecting admin to dashboard');
          router.replace('/(admin)/dashboard');
        } else {
          console.log('👤 Redirecting user to home');
          router.replace('/(tabs)/home');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, isAdmin]);

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
