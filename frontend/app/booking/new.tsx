import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { tvBrands, issueTypes } from '../../data/mockProducts';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Shop address constant
const SHOP_ADDRESS = 'No. 12, Keyzer Street, Colombo 11, Pettah';

export default function NewBookingScreen() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  const [tvBrand, setTvBrand] = useState('');
  const [tvModel, setTvModel] = useState('');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [address, setAddress] = useState('');
  const [pickupOption, setPickupOption] = useState<'pickup' | 'visit'>('pickup');
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // Load saved addresses
  useEffect(() => {
    loadSavedAddresses();
  }, []);

  // Auto-fill address based on service option and address selection
  useEffect(() => {
    if (pickupOption === 'visit') {
      // Auto-fill shop address for "Visit to Our Shop"
      setAddress(SHOP_ADDRESS);
      setSelectedAddressId('shop');
    } else if (selectedAddressId !== 'new' && selectedAddressId !== 'shop') {
      // Load selected saved address
      const selected = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selected) {
        setAddress(selected.address);
      }
    } else if (selectedAddressId === 'new') {
      // Clear for manual entry (only if not visit option)
      if (pickupOption !== 'visit') {
        setAddress('');
      }
    }
  }, [pickupOption, selectedAddressId, savedAddresses]);

  const loadSavedAddresses = async () => {
    try {
      const addressesJson = await AsyncStorage.getItem('saved_addresses');
      if (addressesJson) {
        const addresses = JSON.parse(addressesJson);
        setSavedAddresses(addresses);
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  // Check if phone is verified
  const isPhoneVerified = userProfile?.phoneVerified && userProfile?.phone;
  const verifiedPhone = userProfile?.phone || '';

  const handleSubmit = async () => {
    console.log('🔘 Submit button clicked');
    
    // Check phone verification first
    if (!isPhoneVerified) {
      Alert.alert(
        'Phone Verification Required',
        'Please verify your phone number before booking a repair service.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Now', onPress: () => router.push('/profile/edit') }
        ]
      );
      return;
    }
    
    console.log('Form data:', { tvBrand, tvModel, issueType, address, phone: verifiedPhone });
    
    if (!tvBrand || !tvModel || !issueType || !address) {
      console.log('❌ Validation failed - missing required fields');
      Alert.alert('Missing Information', 'Please fill in all required fields:\n• TV Brand\n• TV Model\n• Issue Type\n• Address');
      return;
    }

    console.log('✅ Validation passed, creating booking...');
    setLoading(true);
    
    try {
      const bookingId = `booking_${Date.now()}`;
      const customerName = userProfile?.name || user?.email?.split('@')[0] || 'Unknown Customer';
      const bookingData = {
        id: bookingId,
        userId: user?.uid,
        customerName,
        customerPhone: verifiedPhone,
        tvBrand,
        tvModel,
        issueType,
        issueDescription,
        address,
        phone: verifiedPhone, // Keep for backward compatibility
        serviceType: pickupOption,
        pickupOption,
        status: 'pending',
        timeline: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Booking created',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('💾 Saving booking data...', bookingData);

      if (isFirebaseConfigured) {
        // Firebase mode
        console.log('📤 Saving to Firebase...');
        await addDoc(collection(db, 'bookings'), bookingData);
      } else {
        // Demo mode - save to local storage
        console.log('💾 Saving to local storage (Demo mode)...');
        const bookingsJson = await AsyncStorage.getItem('local_bookings');
        const bookings = bookingsJson ? JSON.parse(bookingsJson) : [];
        bookings.push(bookingData);
        await AsyncStorage.setItem('local_bookings', JSON.stringify(bookings));
        console.log('✅ Saved to local storage. Total bookings:', bookings.length);
      }
      
      console.log('🎉 Booking created successfully!');
      
      // Navigate to success screen with booking details
      router.push({
        pathname: '/booking/success',
        params: {
          bookingId: bookingId,
          tvBrand: tvBrand,
          tvModel: tvModel,
          issueType: issueTypes.find(i => i.value === issueType)?.label || issueType,
          phone: verifiedPhone,
        }
      });
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      Alert.alert('Error', `Failed to create booking: ${error.message || 'Unknown error'}\n\nPlease try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Book Repair Service</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* TV Brand */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TV Brand *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowBrandPicker(!showBrandPicker)}
            >
              <Text style={[styles.pickerText, !tvBrand && styles.placeholder]}>
                {tvBrand || 'Select TV Brand'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
            </TouchableOpacity>
            {showBrandPicker && (
              <View style={styles.pickerOptions}>
                {tvBrands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={styles.pickerOption}
                    onPress={() => {
                      setTvBrand(brand);
                      setShowBrandPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* TV Model */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TV Model *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., UN55TU7000"
              value={tvModel}
              onChangeText={setTvModel}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Issue Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issue Type *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowIssuePicker(!showIssuePicker)}
            >
              <Text style={[styles.pickerText, !issueType && styles.placeholder]}>
                {issueTypes.find((i) => i.value === issueType)?.label || 'Select Issue Type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
            </TouchableOpacity>
            {showIssuePicker && (
              <View style={styles.pickerOptions}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {issueTypes.map((issue) => (
                    <TouchableOpacity
                      key={issue.value}
                      style={styles.pickerOption}
                      onPress={() => {
                        setIssueType(issue.value);
                        setShowIssuePicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{issue.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Issue Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issue Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue in detail..."
              value={issueDescription}
              onChangeText={setIssueDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Phone Number - Verified from Profile */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Phone Number *</Text>
              {isPhoneVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            
            {isPhoneVerified ? (
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.verifiedPhoneText}>{verifiedPhone}</Text>
              </View>
            ) : (
              <View style={styles.verificationRequired}>
                <View style={styles.verificationMessage}>
                  <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary} />
                  <View style={styles.messageTextContainer}>
                    <Text style={styles.verificationTitle}>Phone Verification Required</Text>
                    <Text style={styles.verificationText}>
                      Please verify your phone number in your profile before booking.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.verifyNowButton}
                  onPress={() => router.push('/profile/edit')}
                >
                  <Ionicons name="shield-checkmark" size={18} color={Colors.textWhite} />
                  <Text style={styles.verifyNowText}>Verify Now</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Address *</Text>
            
            {/* Address Selection - Only show for pickup option */}
            {pickupOption === 'pickup' && (
              <>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowAddressPicker(!showAddressPicker)}
                >
                  <Text style={[styles.pickerText, selectedAddressId === 'new' && styles.placeholder]}>
                    {selectedAddressId === 'new' 
                      ? 'Enter New Address' 
                      : savedAddresses.find(addr => addr.id === selectedAddressId)?.label || 'Select Address'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
                </TouchableOpacity>
                
                {showAddressPicker && (
                  <View style={styles.pickerOptions}>
                    <TouchableOpacity
                      style={styles.pickerOption}
                      onPress={() => {
                        setSelectedAddressId('new');
                        setAddress('');
                        setShowAddressPicker(false);
                      }}
                    >
                      <View style={styles.addressOptionRow}>
                        <Ionicons name="create-outline" size={20} color={Colors.primary} />
                        <Text style={styles.pickerOptionText}>Enter New Address</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {savedAddresses.map((addr) => (
                      <TouchableOpacity
                        key={addr.id}
                        style={styles.pickerOption}
                        onPress={() => {
                          setSelectedAddressId(addr.id);
                          setAddress(addr.address);
                          setShowAddressPicker(false);
                        }}
                      >
                        <View style={styles.addressOptionRow}>
                          <Ionicons name="location" size={20} color={Colors.primary} />
                          <View style={styles.addressOptionContent}>
                            <Text style={styles.addressOptionLabel}>{addr.label}</Text>
                            <Text style={styles.addressOptionText} numberOfLines={1}>
                              {addr.address}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
            
            {/* Address Display/Input */}
            {pickupOption === 'visit' ? (
              // Shop address - read only
              <View style={[styles.input, styles.inputDisabled, styles.textArea]}>
                <View style={styles.shopAddressHeader}>
                  <Ionicons name="storefront" size={18} color={Colors.primary} />
                  <Text style={styles.shopAddressLabel}>WeFix.lk Service Center</Text>
                </View>
                <Text style={styles.shopAddressText}>{SHOP_ADDRESS}</Text>
              </View>
            ) : (
              // Customer address - editable for new address or read-only for saved
              <TextInput
                style={[styles.input, styles.textArea, selectedAddressId !== 'new' && styles.inputDisabled]}
                placeholder="Enter your full address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.textLight}
                editable={selectedAddressId === 'new'}
              />
            )}
          </View>

          {/* Pickup/Delivery Option */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Option *</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  pickupOption === 'pickup' && styles.optionCardActive,
                ]}
                onPress={() => {
                  setPickupOption('pickup');
                  setSelectedAddressId('new');
                  setAddress('');
                }}
              >
                <Ionicons
                  name="car"
                  size={32}
                  color={pickupOption === 'pickup' ? Colors.primary : Colors.textLight}
                />
                <Text
                  style={[
                    styles.optionText,
                    pickupOption === 'pickup' && styles.optionTextActive,
                  ]}
                >
                  Pick Up
                </Text>
                <Text style={styles.optionSubtext}>We'll collect your TV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  pickupOption === 'visit' && styles.optionCardActive,
                ]}
                onPress={() => {
                  setPickupOption('visit');
                  setSelectedAddressId('shop');
                  setAddress(SHOP_ADDRESS);
                }}
              >
                <Ionicons
                  name="storefront"
                  size={32}
                  color={pickupOption === 'visit' ? Colors.primary : Colors.textLight}
                />
                <Text
                  style={[
                    styles.optionText,
                    pickupOption === 'visit' && styles.optionTextActive,
                  ]}
                >
                  Visit to Our Shop
                </Text>
                <Text style={styles.optionSubtext}>Bring your TV to us</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating Booking...' : 'Book Repair Service'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  keyboardView: {
    flex: 1,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  inputDisabled: {
    backgroundColor: Colors.backgroundGray,
  },
  verifiedPhoneText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  verificationRequired: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verificationMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  messageTextContainer: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  verificationText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  verifyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  verifyNowText: {
    fontSize: 15,
    color: Colors.textWhite,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textLight,
  },
  pickerOptions: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  optionTextActive: {
    color: Colors.primary,
  },
  optionSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  addressOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressOptionContent: {
    flex: 1,
  },
  addressOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  addressOptionText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  shopAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  shopAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  shopAddressText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});
