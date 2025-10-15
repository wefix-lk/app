import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, StatusColors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  tvBrand: string;
  tvModel: string;
  issueType: string;
  issueDescription: string;
  serviceType: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  adminNote?: string;
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: Colors.warning },
  { label: 'Confirmed', value: 'confirmed', color: '#2196F3' },
  { label: 'Parts Ordered', value: 'parts-ordered', color: '#9C27B0' },
  { label: 'In Progress', value: 'in-progress', color: Colors.info },
  { label: 'Testing', value: 'testing', color: '#FF9800' },
  { label: 'Ready', value: 'ready-for-delivery', color: Colors.success },
  { label: 'Completed', value: 'completed', color: Colors.success },
];

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [editingAdminNote, setEditingAdminNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter]);

  const loadBookings = async () => {
    try {
      // Try both storage keys for compatibility
      let bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (!bookingsJson) {
        bookingsJson = await AsyncStorage.getItem('bookings');
      }
      
      if (bookingsJson) {
        const allBookings: Booking[] = JSON.parse(bookingsJson);
        console.log('📋 Admin loaded bookings:', allBookings.length);
        allBookings.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(allBookings);
      } else {
        console.log('⚠️ No bookings found in storage');
        setBookings([]);
      }
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setBookings([]);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customerName?.toLowerCase().includes(query) ||
          b.customerPhone?.includes(query) ||
          b.tvBrand?.toLowerCase().includes(query) ||
          b.tvModel?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      
      const updatedBookings = bookings.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });

      // Update in both storage locations for compatibility
      await AsyncStorage.setItem('local_bookings', JSON.stringify(updatedBookings));
      await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }

      // Send notification to customer
      if (booking) {
        await sendCustomerNotification(booking.customerName, newStatus);
      }

      setSuccessMessage('✅ Status updated and customer notified');
      console.log(`✅ Updated booking ${bookingId} to ${newStatus}`);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      setSuccessMessage('❌ Failed to update status');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  const sendCustomerNotification = async (customerName: string, status: string) => {
    // Simulate sending notification (in production, use Firebase Cloud Messaging)
    console.log(`📢 Sending notification to ${customerName}: Status updated to ${status}`);
    
    // Store notification in local storage for customer to see
    try {
      const notificationsJson = await AsyncStorage.getItem('customer_notifications');
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      notifications.push({
        id: `notif_${Date.now()}`,
        title: 'Booking Status Updated',
        message: `Your repair status has been updated to: ${STATUS_OPTIONS.find(s => s.value === status)?.label}`,
        timestamp: new Date().toISOString(),
        read: false,
      });
      
      await AsyncStorage.setItem('customer_notifications', JSON.stringify(notifications));
      console.log('✅ Customer notification saved');
    } catch (error) {
      console.error('❌ Failed to save notification:', error);
    }
  };

  const saveAdminNote = async () => {
    if (!selectedBooking) return;

    setNoteSaving(true);
    try {
      const updatedBookings = bookings.map((b) => {
        if (b.id === selectedBooking.id) {
          return {
            ...b,
            adminNote: editingAdminNote,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });

      await AsyncStorage.setItem('local_bookings', JSON.stringify(updatedBookings));
      await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
      setSelectedBooking({ ...selectedBooking, adminNote: editingAdminNote });

      // Send notification to customer about the update
      await sendCustomerNotification(selectedBooking.customerName, selectedBooking.status);

      setSuccessMessage('✅ Note and status updated successfully');
      console.log('✅ Admin note saved for booking:', selectedBooking.id);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Failed to save note:', error);
      setSuccessMessage('❌ Failed to save note. Please try again.');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } finally {
      setNoteSaving(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    Alert.alert(
      'Delete Booking',
      'Permanently delete this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedBookings = bookings.filter((b) => b.id !== bookingId);
              await AsyncStorage.setItem('local_bookings', JSON.stringify(updatedBookings));
              await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
              setBookings(updatedBookings);
              setShowDetailModal(false);
              Alert.alert('Success', 'Booking deleted');
              console.log(`✅ Deleted booking ${bookingId}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditingAdminNote(booking.adminNote || '');
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    return statusOption?.color || Colors.textLight;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings Management</Text>
        <Text style={styles.subtitle}>{filteredBookings.length} bookings</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, phone, model..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>
            All ({bookings.length})
          </Text>
        </TouchableOpacity>
        {STATUS_OPTIONS.map((status) => {
          const count = bookings.filter((b) => b.status === status.value).length;
          return (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.filterChip,
                statusFilter === status.value && { ...styles.filterChipActive, backgroundColor: status.color },
              ]}
              onPress={() => setStatusFilter(status.value)}
            >
              <Text style={[styles.filterText, statusFilter === status.value && styles.filterTextActive]}>
                {status.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => openDetailModal(booking)}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.customerName}>{booking.customerName}</Text>
                  <Text style={styles.phone}>{booking.customerPhone}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {STATUS_OPTIONS.find((s) => s.value === booking.status)?.label}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <Text style={styles.detailText}>
                  📺 {booking.tvBrand} {booking.tvModel}
                </Text>
                <Text style={styles.detailText}>⚠️ {booking.issueType}</Text>
                <Text style={styles.detailText}>📅 {formatDate(booking.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedBooking && (
                <>
                  {successMessage ? (
                    <View style={styles.successBanner}>
                      <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                  ) : null}

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <Text style={styles.infoText}>Name: {selectedBooking.customerName}</Text>
                    <Text style={styles.infoText}>Phone: {selectedBooking.customerPhone}</Text>
                    <Text style={styles.infoText}>Address: {selectedBooking.address}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Device</Text>
                    <Text style={styles.infoText}>Brand: {selectedBooking.tvBrand}</Text>
                    <Text style={styles.infoText}>Model: {selectedBooking.tvModel}</Text>
                    <Text style={styles.infoText}>Issue: {selectedBooking.issueType}</Text>
                    <Text style={styles.infoText}>Description: {selectedBooking.issueDescription}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <TouchableOpacity
                      style={styles.statusSelector}
                      onPress={() => setShowStatusPicker(true)}
                    >
                      <Text>{STATUS_OPTIONS.find((s) => s.value === selectedBooking.status)?.label}</Text>
                      <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Admin Note</Text>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Internal notes..."
                      value={editingAdminNote}
                      onChangeText={setEditingAdminNote}
                      multiline
                    />
                    <TouchableOpacity 
                      style={[styles.saveBtn, noteSaving && styles.saveBtnDisabled]} 
                      onPress={saveAdminNote}
                      disabled={noteSaving}
                    >
                      {noteSaving ? (
                        <ActivityIndicator color={Colors.textWhite} />
                      ) : (
                        <Text style={styles.saveBtnText}>Save Note & Notify Customer</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteBooking(selectedBooking.id)}
                  >
                    <Text style={styles.deleteBtnText}>Delete Booking</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showStatusPicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Update Status</Text>
            <ScrollView>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={styles.statusOption}
                  onPress={() => {
                    if (selectedBooking) {
                      updateBookingStatus(selectedBooking.id, status.value);
                      setShowStatusPicker(false);
                    }
                  }}
                >
                  <Text>{status.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray },
  header: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, height: 44, color: Colors.text },
  filterContainer: { paddingHorizontal: 12, marginBottom: 12, paddingVertical: 4 },
  filterChip: { 
    paddingHorizontal: 10, 
    paddingVertical: 7, 
    borderRadius: 16, 
    backgroundColor: Colors.background, 
    marginRight: 6,
    minWidth: 70,
    maxWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { 
    fontSize: 12, 
    color: Colors.text,
    textAlign: 'center',
  },
  filterTextActive: { color: Colors.textWhite, fontWeight: '600' },
  listContainer: { flex: 1, padding: 16 },
  bookingCard: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginBottom: 12 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bookingInfo: { flex: 1 },
  customerName: { fontSize: 18, fontWeight: '600', color: Colors.text },
  phone: { fontSize: 14, color: Colors.textLight },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  bookingDetails: { gap: 4 },
  detailText: { fontSize: 14, color: Colors.text },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, color: Colors.textLight, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  infoText: { fontSize: 14, marginBottom: 4 },
  statusSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.backgroundGray, borderRadius: 12, padding: 16 },
  noteInput: { backgroundColor: Colors.backgroundGray, borderRadius: 12, padding: 16, minHeight: 100 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.textWhite, fontWeight: '600' },
  successBanner: { backgroundColor: Colors.success + '20', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: Colors.success },
  successText: { fontSize: 14, fontWeight: '600', color: Colors.success },
  deleteBtn: { backgroundColor: Colors.error, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  deleteBtnText: { color: Colors.textWhite, fontWeight: '600' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerContent: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', padding: 20 },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statusOption: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
});
