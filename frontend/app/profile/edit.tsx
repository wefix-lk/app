import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import OTPVerificationModal from '../../components/OTPVerificationModal';

export default function EditProfileScreen() {
  const { userProfile, updateProfile } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [newPhone, setNewPhone] = useState('');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(userProfile?.phoneVerified || false);

  const handlePhoneVerification = () => {
    if (!newPhone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    // Validate Sri Lankan phone number format
    const phoneRegex1 = /^0\d{9}$/; // 0771234567
    const phoneRegex2 = /^\+94\d{9}$/; // +94771234567
    
    if (!phoneRegex1.test(newPhone.trim()) && !phoneRegex2.test(newPhone.trim())) {
      Alert.alert('Invalid Format', 'Please enter a valid phone number (e.g., 0771234567 or +94771234567)');
      return;
    }

    setShowOTPModal(true);
  };

  const handleOTPVerificationSuccess = async () => {
    // Update phone as verified
    const formattedPhone = newPhone.startsWith('0') 
      ? '+94' + newPhone.substring(1) 
      : newPhone;
    
    setPhone(formattedPhone);
    setIsPhoneVerified(true);
    setNewPhone('');
    
    console.log('✅ Phone verified and updated:', formattedPhone);
  };

  const handleSave = async () => {
    if (!isPhoneVerified && phone) {
      Alert.alert('Verification Required', 'Please verify your phone number before saving');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ 
        name, 
        phone, 
        phoneVerified: isPhoneVerified,
        address 
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color={Colors.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={userProfile?.email}
                editable={false}
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            {/* Phone Number Section */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Phone Number *</Text>
                {isPhoneVerified && phone && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>

              {isPhoneVerified && phone ? (
                <View style={styles.verifiedPhoneContainer}>
                  <View style={[styles.input, styles.inputDisabled]}>
                    <Text style={styles.verifiedPhoneText}>{phone}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changePhoneButton}
                    onPress={() => {
                      setIsPhoneVerified(false);
                      setNewPhone(phone);
                    }}
                  >
                    <Text style={styles.changePhoneText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.phoneInputRow}>
                    <TextInput
                      style={[styles.input, styles.phoneInput]}
                      placeholder="+94 77 123 4567"
                      value={newPhone}
                      onChangeText={setNewPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor={Colors.textLight}
                    />
                    <TouchableOpacity
                      style={styles.verifyButton}
                      onPress={handlePhoneVerification}
                    >
                      <Ionicons name="shield-checkmark" size={18} color={Colors.textWhite} />
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>
                    You must verify your phone number to use it in bookings
                  </Text>
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        visible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={newPhone}
        onVerificationSuccess={handleOTPVerificationSuccess}
      />
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color={Colors.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={userProfile?.email}
                editable={false}
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+94 77 123 4567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  form: {
    flex: 1,
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
  inputDisabled: {
    backgroundColor: Colors.backgroundGray,
    color: Colors.textLight,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});
