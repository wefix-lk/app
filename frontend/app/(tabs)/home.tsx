import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import ServiceRequestModal from '../../components/ServiceRequestModal';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const services = [
    {
      id: '1',
      title: 'Book Repair',
      description: 'Schedule TV repair service',
      icon: 'build',
      color: Colors.primary,
      route: '/booking/new',
    },
    {
      id: '2',
      title: 'Check Warranty',
      description: 'Verify warranty status',
      icon: 'shield-checkmark',
      color: Colors.secondary,
      route: '/warranty/check',
    },
    {
      id: '3',
      title: 'Shop Parts',
      description: 'Browse TV parts',
      icon: 'cart',
      color: Colors.info,
      route: '/(tabs)/shop',
    },
    {
      id: '4',
      title: 'Track Repair',
      description: 'View repair status',
      icon: 'location',
      color: Colors.warning,
      route: '/tracking',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{userProfile?.name || 'User'}!</Text>
          </View>
          <View style={styles.logoContainer}>
            <Ionicons name="build" size={32} color={Colors.primary} />
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome to WeFix.lk</Text>
            <Text style={styles.welcomeText}>
              Professional TV repair and original parts delivery service in Sri Lanka
            </Text>
          </View>
          <Ionicons name="tv" size={60} color={Colors.primaryLight} />
        </View>

        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, { borderColor: service.color }]}
                onPress={() => router.push(service.route as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: service.color + '20' }]}>
                  <Ionicons name={service.icon as any} size={32} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose WeFix.lk?</Text>
          <View style={styles.featuresList}>
            <FeatureItem icon="checkmark-circle" text="Expert Technicians" />
            <FeatureItem icon="checkmark-circle" text="Original Parts Only" />
            <FeatureItem icon="checkmark-circle" text="Warranty Coverage" />
            <FeatureItem icon="checkmark-circle" text="Free Pickup & Delivery" />
            <FeatureItem icon="checkmark-circle" text="Real-time Tracking" />
            <FeatureItem icon="checkmark-circle" text="Competitive Pricing" />
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          
          <TouchableOpacity 
            style={styles.contactRow}
            onPress={() => {
              const phoneNumber = '+94112323812';
              Linking.openURL(`tel:${phoneNumber}`);
            }}
          >
            <Ionicons name="call" size={20} color={Colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Landline</Text>
              <Text style={styles.contactText}>+94 11 232 3812</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactRow}
            onPress={() => {
              const whatsappNumber = '94773300905';
              Linking.openURL(`https://wa.me/${whatsappNumber}`);
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color={Colors.secondary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp / Mobile</Text>
              <Text style={styles.contactText}>+94 77 330 0905</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactRow}
            onPress={() => {
              const address = 'No. 12, Keyzer Street, Colombo 11, Pettah';
              const encodedAddress = encodeURIComponent(address);
              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
            }}
          >
            <Ionicons name="location" size={20} color={Colors.error} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Location</Text>
              <Text style={styles.contactText}>No. 12, Keyzer Street,{'\n'}Colombo 11, Pettah</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactRow}
            onPress={() => {
              Linking.openURL('https://wefix.lk');
            }}
          >
            <Ionicons name="globe" size={20} color={Colors.info} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactText}>wefix.lk</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color={Colors.secondary} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeContent: {
    flex: 1,
    marginRight: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textWhite,
    lineHeight: 20,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  serviceCard: {
    width: cardWidth,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  featuresList: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  contactCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
});
