import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, StatusColors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (bookingsJson) {
        const allBookings = JSON.parse(bookingsJson);
        // Filter bookings for current user
        const userBookings = allBookings.filter(
          (b: any) => b.userId === user?.uid
        );
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              Your repair bookings and product orders will appear here
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/booking/new')}
            >
              <Text style={styles.buttonText}>Book Repair Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.orderCard}
              onPress={() => router.push(`/booking/${booking.id}`)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderTitle}>{booking.tvBrand} {booking.tvModel}</Text>
                  <Text style={styles.orderDate}>
                    {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: StatusColors[booking.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: StatusColors[booking.status] },
                    ]}
                  >
                    {booking.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="build-outline" size={16} color={Colors.textLight} />
                  <Text style={styles.detailText}>{booking.issueType.replace('-', ' ')}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name={booking.pickupOption === 'pickup' ? 'car-outline' : 'home-outline'}
                    size={16}
                    color={Colors.textLight}
                  />
                  <Text style={styles.detailText}>
                    {booking.pickupOption === 'pickup' ? 'Pickup Service' : 'Home Service'}
                  </Text>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.viewDetails}>View Details →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  viewDetails: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});
