import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExportData() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const exportToJSON = async () => {
    setExporting(true);
    setExportStatus('Collecting data...');
    
    try {
      const bookings = await AsyncStorage.getItem('bookings');
      const serviceRequests = await AsyncStorage.getItem('service_requests');
      const users = await AsyncStorage.getItem('local_users');
      
      const exportData = {
        exportDate: new Date().toISOString(),
        bookings: bookings ? JSON.parse(bookings) : [],
        serviceRequests: serviceRequests ? JSON.parse(serviceRequests) : [],
        users: users ? JSON.parse(users) : {},
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wefix-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('✅ Export complete! File downloaded.');
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('❌ Export failed. Please try again.');
    } finally {
      setExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    setExportStatus('Generating CSV...');
    
    try {
      const bookingsJson = await AsyncStorage.getItem('bookings');
      const bookings = bookingsJson ? JSON.parse(bookingsJson) : [];

      let csv = 'Booking ID,Customer Name,Phone,Brand,Model,Issue,Service Type,Address,Status,Date\n';
      
      bookings.forEach((b: any) => {
        csv += `"${b.id}","${b.customerName}","${b.customerPhone}","${b.tvBrand}","${b.tvModel}","${b.issueType}","${b.serviceType}","${b.address}","${b.status}","${b.createdAt}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wefix-bookings-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('✅ CSV export complete!');
    } catch (error) {
      console.error('CSV export error:', error);
      setExportStatus('❌ CSV export failed.');
    } finally {
      setExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Export Data</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={48} color={Colors.info} />
          <Text style={styles.infoTitle}>Export All Data</Text>
          <Text style={styles.infoText}>
            Download all bookings, service requests, and user data in your preferred format.
          </Text>
        </View>

        {exportStatus ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{exportStatus}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={exportToJSON}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <>
              <Ionicons name="document-text" size={24} color={Colors.textWhite} />
              <View style={styles.exportButtonContent}>
                <Text style={styles.exportButtonTitle}>Export as JSON</Text>
                <Text style={styles.exportButtonSubtitle}>Complete data with all fields</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: Colors.success }, exporting && styles.exportButtonDisabled]}
          onPress={exportToCSV}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <>
              <Ionicons name="grid" size={24} color={Colors.textWhite} />
              <View style={styles.exportButtonContent}>
                <Text style={styles.exportButtonTitle}>Export as CSV</Text>
                <Text style={styles.exportButtonSubtitle}>Spreadsheet format (bookings only)</Text>
              </View>
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
  infoCard: { alignItems: 'center', backgroundColor: Colors.background, padding: 32, borderRadius: 16, marginBottom: 24 },
  infoTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginTop: 16, marginBottom: 8 },
  infoText: { fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 20 },
  statusCard: { backgroundColor: Colors.background, padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
  statusText: { fontSize: 16, fontWeight: '600', color: Colors.text },
  exportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 12, padding: 20, marginBottom: 16, gap: 16 },
  exportButtonDisabled: { opacity: 0.6 },
  exportButtonContent: { flex: 1 },
  exportButtonTitle: { fontSize: 16, fontWeight: '600', color: Colors.textWhite, marginBottom: 4 },
  exportButtonSubtitle: { fontSize: 14, color: Colors.textWhite, opacity: 0.8 },
});
