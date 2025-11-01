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
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { api } from '../../services/api';

export default function WarrantyCheckScreen() {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [warrantyResult, setWarrantyResult] = useState<any>(null);
  const [showNotFound, setShowNotFound] = useState(false);

  const handleCheck = async () => {
    if (!serialNumber.trim()) {
      Alert.alert('Error', 'Please enter a serial number');
      return;
    }

    setLoading(true);
    setShowNotFound(false);
    setWarrantyResult(null);
    
    try {
      const response = await api.warranty.check({
        serialNumber: serialNumber.trim(),
      });
      
      if (response.success && response.data) {
        setWarrantyResult(response.data);
        setShowNotFound(false);
      } else {
        // Should not reach here if backend properly returns 404
        setShowNotFound(true);
        setWarrantyResult(null);
      }
    } catch (error: any) {
      console.error('Warranty check error:', error);
      
      // Handle 404 - WARRANTY_NOT_FOUND
      if (error.message && error.message.toLowerCase().includes('not found')) {
        setShowNotFound(true);
        setWarrantyResult(null);
      } else {
        Alert.alert('Error', 'Failed to check warranty. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemainingText = (daysRemaining: number) => {
    if (daysRemaining < 0) return 'Expired';
    if (daysRemaining === 0) return 'Expires today';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
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
          <Text style={styles.title}>Check Warranty</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Search Input */}
          <View style={styles.searchCard}>
            <View style={styles.iconTitleRow}>
              <Ionicons name="hardware-chip" size={28} color={Colors.primary} />
              <Text style={styles.searchLabel}>Enter Serial Number</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., SN123456789"
              value={serialNumber}
              onChangeText={setSerialNumber}
              placeholderTextColor={Colors.textLight}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.checkButton, loading && styles.checkButtonDisabled]}
              onPress={handleCheck}
              disabled={loading}
            >
              <Text style={styles.checkButtonText}>
                {loading ? 'Checking...' : 'Check Warranty'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Not Found Message */}
          {showNotFound && (
            <View style={styles.notFoundCard}>
              <Ionicons name="alert-circle" size={60} color={Colors.error} />
              <Text style={styles.notFoundTitle}>No Warranty Found</Text>
              <Text style={styles.notFoundText}>
                No warranty found with the provided serial number. Please check the serial number and try again.
              </Text>
            </View>
          )}

          {/* Warranty Result - Valid */}
          {warrantyResult && warrantyResult.isValid && (
            <View style={styles.resultCard}>
              <View style={[styles.statusBadge, { backgroundColor: Colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                <Text style={[styles.statusText, { color: Colors.success }]}>
                  Warranty Active
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Product:</Text>
                <Text style={styles.resultValue}>{warrantyResult.product}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Purchase Date:</Text>
                <Text style={styles.resultValue}>
                  {format(new Date(warrantyResult.purchaseDate), 'dd MMM yyyy')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Expiry Date:</Text>
                <Text style={styles.resultValue}>
                  {format(new Date(warrantyResult.expiryDate), 'dd MMM yyyy')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Time Remaining:</Text>
                <Text style={[styles.resultValue, { color: Colors.success, fontWeight: 'bold' }]}>
                  {getDaysRemainingText(warrantyResult.daysRemaining || 0)}
                </Text>
              </View>

              {warrantyResult.coverageType && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Coverage Type:</Text>
                  <Text style={styles.resultValue}>{warrantyResult.coverageType}</Text>
                </View>
              )}

              {warrantyResult.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{warrantyResult.notes}</Text>
                </View>
              )}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={Colors.info} />
                <Text style={styles.infoText}>
                  Your warranty is active. Contact us for any repair needs covered under warranty.
                </Text>
              </View>
            </View>
          )}

          {/* Warranty Result - Expired */}
          {warrantyResult && !warrantyResult.isValid && (
            <View style={styles.resultCard}>
              <View style={[styles.statusBadge, { backgroundColor: Colors.error + '20' }]}>
                <Ionicons name="close-circle" size={32} color={Colors.error} />
                <Text style={[styles.statusText, { color: Colors.error }]}>
                  Warranty Expired
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Product:</Text>
                <Text style={styles.resultValue}>{warrantyResult.product}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Purchase Date:</Text>
                <Text style={styles.resultValue}>
                  {format(new Date(warrantyResult.purchaseDate), 'dd MMM yyyy')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Expiry Date:</Text>
                <Text style={styles.resultValue}>
                  {format(new Date(warrantyResult.expiryDate), 'dd MMM yyyy')}
                </Text>
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color={Colors.error} />
                <Text style={styles.warningText}>
                  {warrantyResult.message || 'This warranty has expired. Contact us for paid repair services.'}
                </Text>
              </View>
            </View>
          )}

          {/* Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Where to find Serial Number?</Text>
            <View style={styles.infoItem}>
              <Ionicons name="hardware-chip" size={20} color={Colors.primary} />
              <Text style={styles.infoItemText}>
                <Text style={{ fontWeight: '600' }}>Back Panel:</Text> Check the back of your TV for a sticker with the serial number
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="settings" size={20} color={Colors.primary} />
              <Text style={styles.infoItemText}>
                <Text style={{ fontWeight: '600' }}>Settings Menu:</Text> Go to Settings → About/System → Serial Number
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
              <Text style={styles.infoItemText}>
                <Text style={{ fontWeight: '600' }}>Purchase Documents:</Text> Check your purchase invoice or warranty card
              </Text>
            </View>
          </View>
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
  searchCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  input: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  checkButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  notFoundCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  notesBox: {
    backgroundColor: Colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: Colors.error + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
    lineHeight: 20,
  },
});
