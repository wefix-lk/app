import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  serviceRequests: number;
}

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    inProgressBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    serviceRequests: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const navigateToBookings = (filter?: string) => {
    if (filter) {
      router.push({
        pathname: '/(admin)/bookings',
        params: { filter },
      });
    } else {
      router.push('/(admin)/bookings');
    }
  };

  const navigateToServiceRequests = () => {
    router.push('/(admin)/requests');
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load all bookings - try both storage keys
      let bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (!bookingsJson) {
        bookingsJson = await AsyncStorage.getItem('bookings');
      }
      const bookings = bookingsJson ? JSON.parse(bookingsJson) : [];
      console.log('📊 Dashboard loaded bookings:', bookings.length);

      // Load service requests
      const requestsJson = await AsyncStorage.getItem('service_requests');
      const requests = requestsJson ? JSON.parse(requestsJson) : [];

      // Calculate stats - updated to match the 7 status options
      const pending = bookings.filter((b: any) => b.status === 'pending').length;
      const inProgress = bookings.filter((b: any) => b.status === 'in-progress').length;
      const completed = bookings.filter((b: any) => b.status === 'completed').length;
      const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pending,
        inProgressBookings: inProgress,
        completedBookings: completed,
        cancelledBookings: cancelled,
        serviceRequests: requests.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back, Admin!</Text>
            <Text style={styles.email}>{userProfile?.email}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.textWhite} />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Dashboard Overview</Text>
          
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="construct"
            color={Colors.primary}
            onPress={navigateToBookings}
          />

          <StatCard
            title="Pending Repairs"
            value={stats.pendingBookings}
            icon="time"
            color={Colors.warning}
            onPress={navigateToBookings}
          />

          <StatCard
            title="In Progress"
            value={stats.inProgressBookings}
            icon="hammer"
            color={Colors.info}
          />

          <StatCard
            title="Completed"
            value={stats.completedBookings}
            icon="checkmark-circle"
            color={Colors.success}
          />

          <StatCard
            title="Cancelled"
            value={stats.cancelledBookings}
            icon="close-circle"
            color={Colors.error}
          />

          <StatCard
            title="New Service Requests"
            value={stats.serviceRequests}
            icon="layers"
            color="#6F42C1"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Create New Booking</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications" size={24} color={Colors.secondary} />
            <Text style={styles.actionButtonText}>Send Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={24} color={Colors.info} />
            <Text style={styles.actionButtonText}>Export Reports</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Navigate to other tabs to manage bookings, warranty checks, and service requests.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  email: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  adminBadgeText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
