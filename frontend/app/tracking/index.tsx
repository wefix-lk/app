import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { api, PRODUCTION_MODE } from '../../services/api';

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: 'hourglass-outline' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'parts-ordered', label: 'Parts Ordered', icon: 'cube' },
  { key: 'in-progress', label: 'In Progress', icon: 'construct' },
  { key: 'testing', label: 'Testing', icon: 'flask' },
  { key: 'ready', label: 'Ready', icon: 'checkmark-done' },
  { key: 'completed', label: 'Completed', icon: 'trophy' },
];

const getStatusIndex = (status: string) => {
  const index = statusSteps.findIndex(step => step.key === status);
  return index >= 0 ? index : 0;
};

export default function TrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<any>(null);

  useEffect(() => {
    loadBookings();
    
    // Reload bookings when screen comes into focus
    const unsubscribe = router.addListener?.('focus', () => {
      console.log('🔄 Tracking screen focused, reloading bookings...');
      loadBookings();
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      console.log('📥 Loading bookings for tracking...');
      console.log('🌐 Using:', PRODUCTION_MODE ? 'Production API' : 'Demo Mode');
      
      if (PRODUCTION_MODE) {
        // Production API mode
        const response = await api.bookings.getUserBookings();
        
        if (response.success && response.data) {
          const userBookings = response.data.bookings || [];
          console.log('✅ Loaded', userBookings.length, 'bookings from API for tracking');
          setBookings(userBookings);
        } else {
          console.log('ℹ️ No bookings found in API');
          setBookings([]);
        }
      } else {
        // Demo mode - load from AsyncStorage
        const bookingsJson = await AsyncStorage.getItem('local_bookings');
        if (bookingsJson) {
          const allBookings = JSON.parse(bookingsJson);
          const userBookings = allBookings.filter(
            (b: any) => b.userId === user?.uid
          );
          // Sort by most recent
          userBookings.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setBookings(userBookings);
        } else {
          setBookings([]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking: any) => {
    console.log('🔘 Cancel button clicked for booking:', booking.id);
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      console.log('🚫 Cancelling booking:', bookingToCancel.id);
      setShowCancelModal(false);
      
      // Load all bookings
      const bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (bookingsJson) {
        const allBookings = JSON.parse(bookingsJson);
        
        // Find and update the booking
        const updatedBookings = allBookings.map((b: any) => {
          if (b.id === bookingToCancel.id) {
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
        
        // Save back to storage
        await AsyncStorage.setItem('local_bookings', JSON.stringify(updatedBookings));
        
        // Reload bookings to update UI
        await loadBookings();
        
        console.log('✅ Booking cancelled successfully');
        
        // Show success message
        Alert.alert(
          'Success',
          'Your booking has been successfully cancelled.',
          [{ text: 'OK' }]
        );
      }
      
      setBookingToCancel(null);
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking. Please try again.');
      setBookingToCancel(null);
    }
  };

  const handleDeleteBooking = (booking: any) => {
    console.log('🗑️ Delete button clicked for booking:', booking.id);
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      console.log('🗑️ Permanently deleting booking:', bookingToDelete.id);
      setShowDeleteModal(false);
      
      // Load all bookings
      const bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (bookingsJson) {
        const allBookings = JSON.parse(bookingsJson);
        
        // Remove the booking completely
        const updatedBookings = allBookings.filter((b: any) => b.id !== bookingToDelete.id);
        
        // Save back to storage
        await AsyncStorage.setItem('local_bookings', JSON.stringify(updatedBookings));
        
        // Reload bookings to update UI
        await loadBookings();
        
        console.log('✅ Booking permanently deleted');
        
        // Show success message
        Alert.alert(
          'Deleted',
          'Booking deleted successfully.',
          [{ text: 'OK' }]
        );
      }
      
      setBookingToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting booking:', error);
      Alert.alert('Error', 'Failed to delete booking. Please try again.');
      setBookingToDelete(null);
    }
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
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
        <Text style={styles.title}>Track Repair</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Active Repairs</Text>
            <Text style={styles.emptyText}>
              Book a repair service to track its progress here
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/booking/new')}
            >
              <Text style={styles.buttonText}>Book Repair Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map((booking) => {
            // Support both camelCase and snake_case for backward compatibility
            const tvBrand = booking.tv_brand || booking.tvBrand || '';
            const tvModel = booking.tv_model || booking.tvModel || '';
            const issueType = booking.issue_type || booking.issueType || '';
            const createdAt = booking.created_at || booking.createdAt || '';
            const pickupOption = booking.pickup_option || booking.pickupOption || '';
            
            const currentStatusIndex = getStatusIndex(booking.status);
            
            return (
              <View key={booking.id} style={styles.trackingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.tvName}>{tvBrand} {tvModel}</Text>
                    <Text style={styles.issueType}>{issueType.replace(/-/g, ' ')}</Text>
                  </View>
                  <View style={styles.cardHeaderRight}>
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
                    {/* Trash icon for cancelled bookings */}
                    {booking.status === 'cancelled' && (
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => handleDeleteBooking(booking)}
                      >
                        <Ionicons name="trash" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.timeline}>
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <View key={step.key} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                          <View
                            style={[
                              styles.timelineIcon,
                              isCompleted && styles.timelineIconCompleted,
                              isCurrent && styles.timelineIconCurrent,
                            ]}
                          >
                            <Ionicons
                              name={step.icon as any}
                              size={20}
                              color={
                                isCompleted
                                  ? isCurrent
                                    ? Colors.primary
                                    : Colors.success
                                  : Colors.textLight
                              }
                            />
                          </View>
                          {index < statusSteps.length - 1 && (
                            <View
                              style={[
                                styles.timelineLine,
                                isCompleted && styles.timelineLineCompleted,
                              ]}
                            />
                          )}
                        </View>
                        <View style={styles.timelineRight}>
                          <Text
                            style={[
                              styles.timelineLabel,
                              isCompleted && styles.timelineLabelCompleted,
                            ]}
                          >
                            {step.label}
                          </Text>
                          {isCurrent && (
                            <Text style={styles.currentLabel}>Current Status</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.bookingInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
                    <Text style={styles.infoText}>
                      Booked: {createdAt ? format(new Date(createdAt), 'dd MMM yyyy') : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name={pickupOption === 'pickup' ? 'car-outline' : 'home-outline'}
                      size={16}
                      color={Colors.textLight}
                    />
                    <Text style={styles.infoText}>
                      {pickupOption === 'pickup' ? 'Pick Up Service' : 'Visit to Our Shop'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => router.push(`/booking/${booking.id}`)}
                >
                  <Text style={styles.detailsButtonText}>View Full Details</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>

                {/* Cancel Booking Button - Only for early stages */}
                {(booking.status === 'pending' || 
                  booking.status === 'under-inspection') && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(booking)}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Booking"
        message="Are you sure you want to cancel this repair booking?"
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        onConfirm={confirmCancelBooking}
        onCancel={() => {
          setShowCancelModal(false);
          setBookingToCancel(null);
        }}
        confirmColor={Colors.error}
        icon="alert-circle"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Booking"
        message="Are you sure you want to permanently delete this cancelled booking? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Keep Record"
        onConfirm={confirmDeleteBooking}
        onCancel={() => {
          setShowDeleteModal(false);
          setBookingToDelete(null);
        }}
        confirmColor={Colors.error}
        icon="trash"
      />
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
  trackingCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tvName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  issueType: {
    fontSize: 14,
    color: Colors.textLight,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeline: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  timelineIconCurrent: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.success,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 8,
  },
  timelineLabel: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 4,
  },
  timelineLabelCompleted: {
    color: Colors.text,
    fontWeight: '500',
  },
  currentLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  bookingInfo: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  detailsButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.error,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: Colors.background,
  },
  cancelButtonText: {
    fontSize: 15,
    color: Colors.error,
    fontWeight: '600',
    marginLeft: 6,
  },
});
