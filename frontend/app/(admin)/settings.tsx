import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminSettings() {
  const { signOut, userProfile } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleAdminProfile = () => {
    Alert.alert(
      'Admin Profile',
      'Profile management feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all bookings, warranties, and service requests to a CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Data export feature coming soon!');
          },
        },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'This will create a backup of all app data to Firebase/Cloud storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Backup',
          onPress: () => {
            Alert.alert('Success', 'Data backup feature coming soon!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="settings" size={40} color={Colors.primary} />
          <Text style={styles.title}>Admin Settings</Text>
          <Text style={styles.subtitle}>{userProfile?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color={Colors.text} />
            <Text style={styles.menuText}>Admin Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="key-outline" size={24} color={Colors.text} />
            <Text style={styles.menuText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="download-outline" size={24} color={Colors.info} />
            <Text style={styles.menuText}>Export All Data</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="cloud-upload-outline" size={24} color={Colors.success} />
            <Text style={styles.menuText}>Backup Data</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 (MVP)</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Admin Email</Text>
            <Text style={styles.infoValue}>{userProfile?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors.textWhite} />
          <Text style={styles.logoutButtonText}>Logout from Admin Panel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12, paddingLeft: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginBottom: 8, gap: 12 },
  menuText: { flex: 1, fontSize: 16, color: Colors.text },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginBottom: 8 },
  infoLabel: { fontSize: 14, color: Colors.textLight },
  infoValue: { fontSize: 14, fontWeight: '500', color: Colors.text },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.error, borderRadius: 12, padding: 16, marginTop: 16, gap: 8 },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: Colors.textWhite },
});
