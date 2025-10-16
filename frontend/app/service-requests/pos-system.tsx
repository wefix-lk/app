import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface ServiceRequest {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  dateRequested: string;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Completed';
  notes?: string;
  serviceType: string;
}

const SERVICE_TYPE = 'pos-system';
const SERVICE_NAME = 'POS System';
const STORAGE_KEY = `service_requests_${SERVICE_TYPE}`;

export default function POSSystemRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [requests, filterStatus]);

  const loadRequests = async () => {
    try {
      const requestsJson = await AsyncStorage.getItem(STORAGE_KEY);
      let requestsData = requestsJson ? JSON.parse(requestsJson) : [];
      
      // Add demo data if empty
      if (requestsData.length === 0) {
        requestsData = [
          {
            id: '1',
            customerName: 'John Doe',
            phone: '+94771234567',
            email: 'john@example.com',
            dateRequested: new Date().toISOString(),
            status: 'Pending',
            serviceType: SERVICE_TYPE,
            notes: '',
          },
          {
            id: '2',
            customerName: 'Jane Smith',
            phone: '+94779876543',
            email: 'jane@example.com',
            dateRequested: new Date(Date.now() - 86400000).toISOString(),
            status: 'Contacted',
            serviceType: SERVICE_TYPE,
            notes: 'Discussed requirements',
          },
        ];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(requestsData));
      }
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const applyFilter = () => {
    if (filterStatus === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === filterStatus));
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: ServiceRequest['status']) => {
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: newStatus } : r
    );
    setRequests(updatedRequests);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    Alert.alert('Success', `Status updated to ${newStatus}`);
  };

  const addNote = async (requestId: string, note: string) => {
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, notes: note } : r
    );
    setRequests(updatedRequests);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    setNoteText('');
    setShowDetailModal(false);
    Alert.alert('Success', 'Note added successfully');
  };

  const exportToCSV = async () => {
    try {
      const csvHeader = 'Customer Name,Phone,Email,Date Requested,Status,Notes\n';
      const csvRows = filteredRequests
        .map(
          (r) =>
            `"${r.customerName}","${r.phone}","${r.email || ''}","${new Date(
              r.dateRequested
            ).toLocaleDateString()}","${r.status}","${r.notes || ''}"`
        )
        .join('\n');
      const csvContent = csvHeader + csvRows;

      const fileUri = FileSystem.documentDirectory + `${SERVICE_TYPE}_requests.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'CSV file created successfully');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#F59E0B';
      case 'Contacted':
        return '#3B82F6';
      case 'Quoted':
        return '#8B5CF6';
      case 'Completed':
        return '#10B981';
      default:
        return Colors.textLight;
    }
  };

  const renderRequestCard = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setNoteText(item.notes || '');
        setShowDetailModal(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <Ionicons name="person-circle" size={24} color={Colors.primary} />
          <View style={styles.nameSection}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.customerPhone}>{item.phone}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {item.email && (
        <View style={styles.emailRow}>
          <Ionicons name="mail" size={16} color={Colors.textLight} />
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
      )}

      <View style={styles.dateRow}>
        <Ionicons name="calendar" size={16} color={Colors.textLight} />
        <Text style={styles.dateText}>
          {new Date(item.dateRequested).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      {item.notes && (
        <View style={styles.notesPreview}>
          <Ionicons name="document-text" size={14} color={Colors.textLight} />
          <Text style={styles.notesText} numberOfLines={1}>
            {item.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleSection}>
          <Text style={styles.breadcrumb}>Service Requests › </Text>
          <Text style={styles.headerTitle}>{SERVICE_NAME}</Text>
        </View>
        <TouchableOpacity onPress={exportToCSV} style={styles.exportButton}>
          <Ionicons name="download" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="funnel" size={18} color={Colors.primary} />
          <Text style={styles.filterButtonText}>
            Filter: {filterStatus === 'all' ? 'All' : filterStatus}
          </Text>
        </TouchableOpacity>
        <Text style={styles.resultCount}>
          {filteredRequests.length} {filteredRequests.length === 1 ? 'Request' : 'Requests'}
        </Text>
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Requests Found</Text>
            <Text style={styles.emptyText}>
              {filterStatus === 'all'
                ? 'No service requests available yet'
                : `No ${filterStatus.toLowerCase()} requests found`}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Status</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {['all', 'Pending', 'Contacted', 'Quoted', 'Completed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    filterStatus === status && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterStatus(status);
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterStatus === status && styles.filterOptionTextActive,
                    ]}
                  >
                    {status === 'all' ? 'All Requests' : status}
                  </Text>
                  {filterStatus === status && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailBody}>
              {selectedRequest && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Customer Name</Text>
                    <Text style={styles.detailValue}>{selectedRequest.customerName}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{selectedRequest.phone}</Text>
                  </View>

                  {selectedRequest.email && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Email Address</Text>
                      <Text style={styles.detailValue}>{selectedRequest.email}</Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Date Requested</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedRequest.dateRequested).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Current Status</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(selectedRequest.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(selectedRequest.status) },
                        ]}
                      >
                        {selectedRequest.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statusButtons}>
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    <View style={styles.statusButtonRow}>
                      {['Pending', 'Contacted', 'Quoted', 'Completed'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            selectedRequest.status === status && styles.statusButtonActive,
                          ]}
                          onPress={() =>
                            updateRequestStatus(selectedRequest.id, status as any)
                          }
                        >
                          <Text
                            style={[
                              styles.statusButtonText,
                              selectedRequest.status === status &&
                                styles.statusButtonTextActive,
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.notesSection}>
                    <Text style={styles.sectionTitle}>Internal Notes</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Add notes about this request..."
                      multiline
                      numberOfLines={4}
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholderTextColor={Colors.textLight}
                    />
                    <TouchableOpacity
                      style={styles.saveNoteButton}
                      onPress={() => addNote(selectedRequest.id, noteText)}
                    >
                      <Text style={styles.saveNoteButtonText}>Save Note</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitleSection: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumb: {
    fontSize: 14,
    color: Colors.textLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  exportButton: {
    padding: 8,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameSection: {
    marginLeft: 8,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  emailText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  notesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  detailModalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalBody: {
    maxHeight: 300,
  },
  detailBody: {
    padding: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  filterOptionActive: {
    backgroundColor: Colors.backgroundGray,
  },
  filterOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  filterOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
  },
  statusButtons: {
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  statusButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusButtonText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: Colors.textWhite,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: 8,
  },
  notesInput: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveNoteButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  saveNoteButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});
