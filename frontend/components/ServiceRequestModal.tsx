import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServiceRequestModalProps {
  visible: boolean;
  onClose: () => void;
  serviceTitle: string;
  serviceType: string;
  borderColor: string;
}

export default function ServiceRequestModal({
  visible,
  onClose,
  serviceTitle,
  serviceType,
  borderColor,
}: ServiceRequestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDescription('');
    setErrorMessage('');
  };

  const getServiceDescription = () => {
    switch (serviceType) {
      case 'Web Designing':
        return 'We build modern, responsive, and SEO-optimized websites tailored to your brand — from personal portfolios to large business sites. Tell us your vision and layout style.';
      case 'Web SEO Management':
        return 'Improve your website ranking on Google and attract more customers through keyword targeting, link building, and performance analytics. Tell us about your goals.';
      case 'POS System':
        return 'Manage billing, stock, and daily sales easily with our smart Point of Sale systems for shops, cafés, and restaurants. Tell us your business type and needs.';
      case 'Mobile Application':
        return 'We design and develop Android & iOS apps with modern interfaces and smooth functionality — from e-commerce to service apps. Tell us what you want built.';
      default:
        return '';
    }
  };

  const getServiceTypeKey = () => {
    switch (serviceType) {
      case 'Web Designing':
        return 'web-design';
      case 'Web SEO Management':
        return 'web-seo';
      case 'POS System':
        return 'pos-system';
      case 'Mobile Application':
        return 'mobile-app';
      default:
        return 'web-design';
    }
  };

  const validatePhone = (phone: string) => {
    // Sri Lankan phone number validation with +94 format or 0 format
    const phoneRegex1 = /^0\d{9}$/; // 0771234567
    const phoneRegex2 = /^\+94\d{9}$/; // +94771234567
    return phoneRegex1.test(phone) || phoneRegex2.test(phone);
  };

  const validateEmail = (email: string) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhone = (phone: string) => {
    // Convert 0771234567 to +94771234567
    if (phone.startsWith('0')) {
      return '+94' + phone.substring(1);
    }
    return phone;
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    // Validation
    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number');
      return;
    }

    if (!validatePhone(phone.trim())) {
      setErrorMessage('Please enter a valid phone number (e.g., 0771234567 or +94771234567)');
      return;
    }

    if (email.trim() && !validateEmail(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your address');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please describe your project requirements');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone.trim());
      const serviceTypeKey = getServiceTypeKey();
      
      const requestData = {
        id: `${serviceTypeKey}_${Date.now()}`,
        customerName: name.trim(),
        phone: formattedPhone,
        email: email.trim() || undefined,
        address: address.trim(),
        dateRequested: new Date().toISOString(),
        status: 'Pending',
        serviceType: serviceTypeKey,
        notes: description.trim(),
      };

      // Store in service-specific storage for admin panel
      const storageKey = `service_requests_${serviceTypeKey}`;
      const requestsJson = await AsyncStorage.getItem(storageKey);
      const requests = requestsJson ? JSON.parse(requestsJson) : [];
      requests.push(requestData);
      await AsyncStorage.setItem(storageKey, JSON.stringify(requests));

      console.log('✅ Service request submitted:', requestData);

      // Show success state
      setShowSuccess(true);

      // Auto-close modal after 4 seconds
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onClose();
      }, 4000);
    } catch (error) {
      console.error('❌ Error submitting request:', error);
      setErrorMessage('⚠️ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const whatsappNumber = '94773300905';
    const message = `Hi WeFix.lk, I'm interested in ${serviceType} service. ${description ? `Details: ${description}` : ''}`;
    const encodedMessage = encodeURIComponent(message);
    Linking.openURL(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { borderTopColor: borderColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{serviceTitle}</Text>
              <Text style={styles.subtitle}>Tell us about your requirements</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {showSuccess ? (
              /* Success Confirmation View */
              <View style={styles.successView}>
                <View style={[styles.successIconCircle, { backgroundColor: borderColor + '20' }]}>
                  <Ionicons name="checkmark-circle" size={80} color={borderColor} />
                </View>
                <Text style={styles.successTitle}>Request Submitted Successfully!</Text>
                <Text style={styles.successMessage}>
                  Thank you for your service request! Our WeFix.lk team will review your {serviceType} requirements and contact you within 24 hours via phone or WhatsApp to discuss further details.
                </Text>
                <View style={styles.autoCloseNotice}>
                  <Ionicons name="time-outline" size={16} color={Colors.textLight} />
                  <Text style={styles.autoCloseText}>Closing automatically...</Text>
                </View>
              </View>
            ) : (
              <>
                {/* Service Description */}
                <View style={styles.descriptionBox}>
                  <Ionicons name="information-circle" size={20} color={borderColor} />
                  <Text style={styles.descriptionText}>{getServiceDescription()}</Text>
                </View>

                {/* Error Message */}
                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color={Colors.error} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setErrorMessage('');
                  }}
                  placeholderTextColor={Colors.textLight}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="+94771234567 or 0771234567"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setErrorMessage('');
                  }}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.textLight}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.textLight}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons 
                  name="location-outline" 
                  size={20} 
                  color={Colors.textLight} 
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your full address"
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    setErrorMessage('');
                  }}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.textLight}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Project Description *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons 
                  name="document-text-outline" 
                  size={20} 
                  color={Colors.textLight}
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={`Describe your ${serviceType} requirements in detail...`}
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    setErrorMessage('');
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.textLight}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: borderColor },
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color={Colors.textWhite} />
                  <Text style={styles.submitButtonText}>Request Quote</Text>
                </>
              )}
            </TouchableOpacity>

            {/* WhatsApp Button */}
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleWhatsAppContact}
            >
              <Ionicons name="logo-whatsapp" size={20} color={Colors.secondary} />
              <Text style={styles.whatsappButtonText}>
                Chat on WhatsApp: +94 77 330 0905
              </Text>
            </TouchableOpacity>
            </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderTopWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  successView: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  autoCloseNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoCloseText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  descriptionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '08',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
    lineHeight: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.text,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary + '15',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
});
