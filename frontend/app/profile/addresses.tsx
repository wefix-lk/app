import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const addressesJson = await AsyncStorage.getItem('saved_addresses');
      if (addressesJson) {
        const savedAddresses = JSON.parse(addressesJson);
        setAddresses(savedAddresses);
      } else {
        // Set default home address if none exists
        const defaultAddresses = [
          {
            id: '1',
            label: 'Home',
            address: '123 Main Street, Colombo 03, Sri Lanka',
            isDefault: true,
          },
        ];
        await AsyncStorage.setItem('saved_addresses', JSON.stringify(defaultAddresses));
        setAddresses(defaultAddresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddresses = async (newAddresses: any[]) => {
    try {
      await AsyncStorage.setItem('saved_addresses', JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    } catch (error) {
      console.error('Error saving addresses:', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleAddAddress = async () => {
    if (!newAddressLabel.trim() || !newAddressText.trim()) {
      Alert.alert('Missing Information', 'Please fill in both label and address');
      return;
    }

    const newAddress = {
      id: Date.now().toString(),
      label: newAddressLabel,
      address: newAddressText,
      isDefault: addresses.length === 0,
    };

    const updatedAddresses = [...addresses, newAddress];
    await saveAddresses(updatedAddresses);
    
    setShowAddModal(false);
    setNewAddressLabel('');
    setNewAddressText('');
  };

  const handleSetDefault = async (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    await saveAddresses(updatedAddresses);
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== id);
            await saveAddresses(updatedAddresses);
          },
        },
      ]
    );
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
        <Text style={styles.title}>Saved Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptyText}>
              Add your delivery addresses for faster checkout
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.buttonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.labelContainer}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.addressText}>{addr.address}</Text>
              <View style={styles.addressActions}>
                {!addr.isDefault && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(addr.id)}
                  >
                    <Text style={styles.actionButtonText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAddress(addr.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                setNewAddressLabel('');
                setNewAddressText('');
              }}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address Label *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Home, Office, etc."
                  value={newAddressLabel}
                  onChangeText={setNewAddressLabel}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter complete address"
                  value={newAddressText}
                  onChangeText={setNewAddressText}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddAddress}
              >
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>
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
  addButton: {
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
  addressCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 14,
    color: Colors.error,
    marginLeft: 4,
  },
});
