import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, StatusColors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      console.log('📥 Loading bookings for user:', user?.uid);
      const bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (bookingsJson) {
        const allBookings = JSON.parse(bookingsJson);
        // Filter bookings for current user
        const userBookings = allBookings.filter(
          (b: any) => b.userId === user?.uid
        );
        // Sort by most recent first
        userBookings.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log('✅ Loaded', userBookings.length, 'bookings');
        setBookings(userBookings);
      } else {
        console.log('ℹ️ No bookings found in storage');
        setBookings([]);
      }
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = (booking: any) => {
    console.log('🚫 Cancel button clicked for:', booking.id);
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      console.log('🚫 Cancelling booking:', selectedBooking.id);
      setShowCancelModal(false);

      const bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (bookingsJson) {
        const allBookings = JSON.parse(bookingsJson);
        
        const updatedBookings = allBookings.map((b: any) => {
          if (b.id === selectedBooking.id) {
            return {
              ...b,
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
              timeline: [
                ...b.timeline,
                {
                  status: 'cancelled',
                  timestamp: new Date().toISOString(),
                  note: 'Booking cancelled by user',
                },
              ],
            };
          }
          return b;
        });
        
        await AsyncStorage.setItem('local_bookings', JSON.stringify(updatedBookings));
        await loadBookings();
        
        console.log('✅ Booking cancelled successfully');
        Alert.alert('Success', 'Booking has been successfully cancelled.');
      }
      
      setSelectedBooking(null);
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking. Please try again.');
      setSelectedBooking(null);
    }
  };

  const handleDeleteBooking = (booking: any) => {
    console.log('🗑️ Delete button clicked for:', booking.id);
    setSelectedBooking(booking);
    setShowDeleteModal(true);
  };

  const confirmDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      console.log('🗑️ Permanently deleting booking:', selectedBooking.id);
      setShowDeleteModal(false);

      const bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (bookingsJson) {
        const allBookings = JSON.parse(bookingsJson);
        const updatedBookings = allBookings.filter((b: any) => b.id !== selectedBooking.id);
        
        await AsyncStorage.setItem('local_bookings', JSON.stringify(updatedBookings));
        await loadBookings();
        
        console.log('✅ Booking permanently deleted');
        Alert.alert('Success', 'Booking deleted successfully.');
      }
      
      setSelectedBooking(null);
    } catch (error) {
      console.error('❌ Error deleting booking:', error);
      Alert.alert('Error', 'Failed to delete booking. Please try again.');
      setSelectedBooking(null);
    }
  };

  const canCancelBooking = (status: string) => {
    const cancellableStatuses = ['pending', 'booking-received', 'under-inspection'];
    return cancellableStatuses.includes(status.toLowerCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cancel Booking Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmText="Yes, Cancel Booking"
        cancelText="No, Keep Booking"
        onConfirm={confirmCancelBooking}
        onCancel={() => {
          setShowCancelModal(false);
          setSelectedBooking(null);
        }}
        confirmColor={Colors.error}
        icon="close-circle"
      />

      {/* Delete Booking Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Booking"
        message="Are you sure you want to permanently delete this booking?"
        confirmText="Yes, Delete"
        cancelText="No, Keep It"
        onConfirm={confirmDeleteBooking}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedBooking(null);
        }}
        confirmColor={Colors.error}
        icon="trash"
      />

      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/booking/new')}
        >
          <Ionicons name="add" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="hourglass-outline" size={60} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptyText}>
            Book a TV repair service to get started
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/booking/new')}
          >
            <Text style={styles.buttonText}>Book Repair Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.bookingCard}
              onPress={() => router.push('/tracking')}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.tvName}>{item.tvBrand} {item.tvModel}</Text>
                  <Text style={styles.issueText}>{item.issueType.replace('-', ' ')}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: StatusColors[item.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: StatusColors[item.status] },
                    ]}
                  >
                    {item.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
                  <Text style={styles.detailText}>
                    {format(new Date(item.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons 
                    name={item.pickupOption === 'pickup' ? 'car-outline' : 'home-outline'}
                    size={16} 
                    color={Colors.textLight} 
                  />
                  <Text style={styles.detailText}>
                    {item.pickupOption === 'pickup' ? 'Free Pickup' : 'Home Service'}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingFooter}>
                <Text style={styles.viewDetails}>View Tracking →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
  listContent: {
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
  },
  bookingCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  tvName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  issueText: {
    fontSize: 14,
    color: Colors.textLight,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewDetails: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});
