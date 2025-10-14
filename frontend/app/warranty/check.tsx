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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, isPast } from 'date-fns';

export default function WarrantyCheckScreen() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'serial' | 'bill' | 'phone'>('serial');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [warrantyResult, setWarrantyResult] = useState<any>(null);

  const handleCheck = async () => {
    if (!searchValue) {
      Alert.alert('Error', 'Please enter a search value');
      return;
    }

    setLoading(true);
    try {
      const warrantyRef = collection(db, 'warranties');
      let field = 'serialNumber';
      if (searchType === 'bill') field = 'billNumber';
      if (searchType === 'phone') field = 'phoneNumber';
      
      const q = query(warrantyRef, where(field, '==', searchValue));
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setWarrantyResult(null);
        let searchLabel = 'serial number';
        if (searchType === 'bill') searchLabel = 'bill number';
        if (searchType === 'phone') searchLabel = 'phone number';
        
        Alert.alert(
          'Not Found',
          `No warranty information found for this ${searchLabel}`
        );
      } else {
        const data = snapshot.docs[0].data();
        const isExpired = isPast(new Date(data.expiryDate));
        setWarrantyResult({ ...data, id: snapshot.docs[0].id, isExpired });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check warranty. Please try again.');
      console.error('Warranty check error:', error);
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
          <Text style={styles.title}>Check Warranty</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Search Type Selection */}
          <View style={styles.searchTypeContainer}>
            <TouchableOpacity
              style={[
                styles.searchTypeButton,
                searchType === 'serial' && styles.searchTypeButtonActive,
              ]}
              onPress={() => {
                setSearchType('serial');
                setSearchValue('');
                setWarrantyResult(null);
              }}
            >
              <Ionicons
                name="hardware-chip"
                size={24}
                color={searchType === 'serial' ? Colors.textWhite : Colors.text}
              />
              <Text
                style={[
                  styles.searchTypeText,
                  searchType === 'serial' && styles.searchTypeTextActive,
                ]}
              >
                Serial Number
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchTypeButton,
                searchType === 'bill' && styles.searchTypeButtonActive,
              ]}
              onPress={() => {
                setSearchType('bill');
                setSearchValue('');
                setWarrantyResult(null);
              }}
            >
              <Ionicons
                name="receipt"
                size={24}
                color={searchType === 'bill' ? Colors.textWhite : Colors.text}
              />
              <Text
                style={[
                  styles.searchTypeText,
                  searchType === 'bill' && styles.searchTypeTextActive,
                ]}
              >
                Bill Number
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchTypeButton,
                searchType === 'phone' && styles.searchTypeButtonActive,
              ]}
              onPress={() => {
                setSearchType('phone');
                setSearchValue('');
                setWarrantyResult(null);
              }}
            >
              <Ionicons
                name="call"
                size={24}
                color={searchType === 'phone' ? Colors.textWhite : Colors.text}
              />
              <Text
                style={[
                  styles.searchTypeText,
                  searchType === 'phone' && styles.searchTypeTextActive,
                ]}
              >
                Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchCard}>
            <Text style={styles.searchLabel}>
              Enter {searchType === 'serial' ? 'Serial Number' : searchType === 'bill' ? 'Bill Number' : 'Phone Number'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                searchType === 'serial'
                  ? 'e.g., SN123456789'
                  : searchType === 'bill'
                  ? 'e.g., BILL-2025-0001'
                  : 'e.g., 0764386737'
              }
              value={searchValue}
              onChangeText={setSearchValue}
              placeholderTextColor={Colors.textLight}
              autoCapitalize={searchType === 'phone' ? 'none' : 'characters'}
              keyboardType={searchType === 'phone' ? 'phone-pad' : 'default'}
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

          {/* Warranty Result */}
          {warrantyResult && (
            <View style={styles.resultCard}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: warrantyResult.isExpired
                      ? Colors.error + '20'
                      : Colors.success + '20',
                  },
                ]}
              >
                <Ionicons
                  name={
                    warrantyResult.isExpired ? 'close-circle' : 'checkmark-circle'
                  }
                  size={24}
                  color={warrantyResult.isExpired ? Colors.error : Colors.success}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: warrantyResult.isExpired ? Colors.error : Colors.success,
                    },
                  ]}
                >
                  {warrantyResult.isExpired ? 'Expired' : 'Active'}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Product:</Text>
                <Text style={styles.resultValue}>{warrantyResult.productName}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Serial Number:</Text>
                <Text style={styles.resultValue}>{warrantyResult.serialNumber}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Bill Number:</Text>
                <Text style={styles.resultValue}>{warrantyResult.billNumber}</Text>
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

              {!warrantyResult.isExpired && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                  <Text style={styles.infoText}>
                    Your warranty is active. Contact us for any repair needs.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Where to find?</Text>
            <View style={styles.infoItem}>
              <Ionicons name="hardware-chip" size={20} color={Colors.primary} />
              <Text style={styles.infoItemText}>
                Serial Number: Usually on the back of your TV or in the settings menu
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="receipt" size={20} color={Colors.primary} />
              <Text style={styles.infoItemText}>
                Bill Number: Check your purchase invoice or receipt
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color={Colors.primary} />
              <Text style={styles.infoItemText}>
                Phone Number: Use the number registered during repair or purchase
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
  searchTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  searchTypeButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  searchTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  searchTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  searchTypeTextActive: {
    color: Colors.textWhite,
  },
  searchCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
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
  resultCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
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
    marginBottom: 12,
  },
  infoItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
    lineHeight: 20,
  },
});
