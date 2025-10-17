import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface OTPVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

export default function OTPVerificationModal({
  visible,
  onClose,
  phoneNumber,
  onVerificationSuccess,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Generate OTP when modal opens (Demo mode - shows OTP in UI)
  useEffect(() => {
    if (visible) {
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(newOTP);
      console.log('📱 Demo OTP generated:', newOTP);
      
      // Start resend timer
      setResendTimer(60);
      setCanResend(false);
      
      // Reset OTP fields
      setOtp(['', '', '', '', '', '']);
    }
  }, [visible]);

  // Countdown timer
  useEffect(() => {
    if (visible && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, visible]);

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOTP = value.slice(0, 6).split('');
      const newOTP = [...otp];
      pastedOTP.forEach((digit, i) => {
        if (index + i < 6) {
          newOTP[index + i] = digit;
        }
      });
      setOtp(newOTP);
      
      // Focus last filled input or next empty
      const lastIndex = Math.min(index + pastedOTP.length, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOTP = otp.join('');
    
    if (enteredOTP.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify OTP (Demo mode - compare with generated OTP)
    if (enteredOTP === generatedOTP) {
      console.log('✅ OTP verified successfully');
      setLoading(false);
      onVerificationSuccess();
      onClose();
      Alert.alert('Success', 'Phone number verified successfully!');
    } else {
      console.log('❌ OTP verification failed');
      setLoading(false);
      Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOTP);
    console.log('📱 New OTP generated:', newOTP);
    
    setResendTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    
    Alert.alert('OTP Resent', `New verification code: ${newOTP}`);
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
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.primary} />
              <Text style={styles.title}>Verify Phone Number</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message}>
              We've sent a 6-digit verification code to
            </Text>
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>

            {/* Demo Mode Notice */}
            <View style={styles.demoNotice}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <View style={styles.demoNoticeText}>
                <Text style={styles.demoTitle}>Demo Mode</Text>
                <Text style={styles.demoMessage}>
                  Your OTP code is: <Text style={styles.otpCode}>{generatedOTP}</Text>
                </Text>
              </View>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendTimer}>
                  Resend code in {resendTimer}s
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.textWhite} />
                </>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={18} color={Colors.textLight} />
              <Text style={styles.helpText}>Didn't receive the code?</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  message: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
    marginBottom: 24,
  },
  demoNoticeText: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  demoMessage: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  otpCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 2,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    backgroundColor: Colors.backgroundGray,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendLink: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  resendTimer: {
    fontSize: 14,
    color: Colors.textLight,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
