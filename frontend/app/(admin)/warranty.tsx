import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function WarrantyManagement() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={40} color={Colors.secondary} />
          <Text style={styles.title}>Warranty Management</Text>
          <Text style={styles.subtitle}>Check and manage product warranties</Text>
        </View>

        <View style={styles.placeholder}>
          <Ionicons name="search-outline" size={64} color={Colors.textLight} />
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Search warranties by serial number, bill number, or phone.{' '}n            Export warranty reports.
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✓ Search by Serial/Bill/Phone</Text>
            <Text style={styles.featureItem}>✓ View warranty status</Text>
            <Text style={styles.featureItem}>✓ Check expiry dates</Text>
            <Text style={styles.featureItem}>✓ Export to CSV</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  placeholder: { alignItems: 'center', padding: 24, backgroundColor: Colors.background, borderRadius: 16 },
  placeholderTitle: { fontSize: 20, fontWeight: '600', color: Colors.text, marginTop: 16 },
  placeholderText: { fontSize: 14, color: Colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  featuresList: { marginTop: 24, alignSelf: 'stretch' },
  featureItem: { fontSize: 14, color: Colors.text, marginVertical: 4, paddingLeft: 20 },
});
