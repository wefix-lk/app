import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>About WeFix.lk</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Ionicons name="build" size={80} color={Colors.primary} />
          <Text style={styles.appName}>WeFix.lk</Text>
          <Text style={styles.tagline}>TV Repair & Parts</Text>
        </View>

        <View style={styles.versionCard}>
          <Text style={styles.versionLabel}>Version</Text>
          <Text style={styles.versionNumber}>1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.description}>
            WeFix.lk is Sri Lanka's leading TV repair and parts service provider. We specialize in repairing all major TV brands and offering original replacement parts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.serviceItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
            <Text style={styles.serviceText}>Professional TV Repairs</Text>
          </View>
          <View style={styles.serviceItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
            <Text style={styles.serviceText}>Original Parts & Components</Text>
          </View>
          <View style={styles.serviceItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
            <Text style={styles.serviceText}>Warranty Support</Text>
          </View>
          <View style={styles.serviceItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
            <Text style={styles.serviceText}>Free Pickup & Delivery</Text>
          </View>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://wefix.lk/privacy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://wefix.lk/terms')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://wefix.lk')}
          >
            <Text style={styles.linkText}>Visit Our Website</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in Sri Lanka</Text>
          <Text style={styles.copyright}>© 2025 WeFix.lk. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
  },
  versionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  versionLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
  },
  linksSection: {
    marginBottom: 24,
  },
  linkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
