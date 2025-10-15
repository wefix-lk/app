import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

export default function ChangePassword() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (currentPassword !== 'swift@123') {
      setErrorMessage('Current password is incorrect');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Password changed successfully! Please logout and login again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            For security, you'll need to enter your current password before setting a new one.
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={24} color={Colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry={!showCurrent}
              placeholderTextColor={Colors.textLight}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Ionicons
                name={showCurrent ? 'eye' : 'eye-off'}
                size={20}
                color={Colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password (min 6 characters)"
              secureTextEntry={!showNew}
              placeholderTextColor={Colors.textLight}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons
                name={showNew ? 'eye' : 'eye-off'}
                size={20}
                color={Colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              secureTextEntry={!showConfirm}
              placeholderTextColor={Colors.textLight}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? 'eye' : 'eye-off'}
                size={20}
                color={Colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.changeButton, loading && styles.changeButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={Colors.textWhite} />
              <Text style={styles.changeButtonText}>Change Password</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: Colors.text },
  content: { padding: 16 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.info + '10', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12, borderWidth: 1, borderColor: Colors.info + '30' },
  infoText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.error + '20', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12 },
  errorText: { flex: 1, fontSize: 14, color: Colors.error, fontWeight: '600' },
  successBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.success + '20', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12 },
  successText: { flex: 1, fontSize: 14, color: Colors.success, fontWeight: '600' },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  input: { flex: 1, height: 48, fontSize: 16, color: Colors.text },
  changeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 12, padding: 16, marginTop: 16, gap: 8 },
  changeButtonDisabled: { opacity: 0.6 },
  changeButtonText: { fontSize: 16, fontWeight: '600', color: Colors.textWhite },
});
