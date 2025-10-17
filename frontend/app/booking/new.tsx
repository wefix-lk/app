import React, { useState } from 'react';
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

export default function NewBookingScreen() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  const [tvBrand, setTvBrand] = useState('');
  const [tvModel, setTvModel] = useState('');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [address, setAddress] = useState('');
  const [pickupOption, setPickupOption] = useState<'pickup' | 'delivery'>('pickup');
  const [loading, setLoading] = useState(false);

  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showIssuePicker, setShowIssuePicker] = useState(false);

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
          phone: phone,
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
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your full address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textLight}
            />
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
                onPress={() => setPickupOption('pickup')}
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
                  Free Pickup
                </Text>
                <Text style={styles.optionSubtext}>We'll collect your TV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  pickupOption === 'delivery' && styles.optionCardActive,
                ]}
                onPress={() => setPickupOption('delivery')}
              >
                <Ionicons
                  name="home"
                  size={32}
                  color={pickupOption === 'delivery' ? Colors.primary : Colors.textLight}
                />
                <Text
                  style={[
                    styles.optionText,
                    pickupOption === 'delivery' && styles.optionTextActive,
                  ]}
                >
                  Home Service
                </Text>
                <Text style={styles.optionSubtext}>We'll come to you</Text>
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
