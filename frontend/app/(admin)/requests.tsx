import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'web-design',
    name: 'Web Designing',
    icon: 'globe',
    route: '/service-requests/web-design',
    color: '#3B82F6',
  },
  {
    id: 'web-seo',
    name: 'Web SEO',
    icon: 'search',
    route: '/service-requests/web-seo',
    color: '#10B981',
  },
  {
    id: 'pos-system',
    name: 'POS System',
    icon: 'calculator',
    route: '/service-requests/pos-system',
    color: '#F59E0B',
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Development',
    icon: 'phone-portrait',
    route: '/service-requests/mobile-app',
    color: '#8B5CF6',
  },
];

export default function ServiceRequests() {
  const router = useRouter();
  const [requestCounts, setRequestCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadRequestCounts();
  }, []);

  const loadRequestCounts = async () => {
    try {
      const counts: { [key: string]: number } = {};
      
      for (const category of serviceCategories) {
        const requestsJson = await AsyncStorage.getItem(`service_requests_${category.id}`);
        const requests = requestsJson ? JSON.parse(requestsJson) : [];
        counts[category.id] = requests.length;
      }
      
      setRequestCounts(counts);
    } catch (error) {
      console.error('❌ Error loading request counts:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Service Requests</Text>
          <Text style={styles.subtitle}>Manage customer service inquiries</Text>
        </View>

        <View style={styles.cardsContainer}>
          {serviceCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.serviceCard}
              onPress={() => router.push(category.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.color + '15' }]}>
                <Ionicons name={category.icon} size={32} color={category.color} />
              </View>
              
              <Text style={styles.serviceName}>{category.name}</Text>
              
              <View style={styles.requestCount}>
                <Text style={styles.countNumber}>
                  {requestCounts[category.id] || 0}
                </Text>
                <Text style={styles.countLabel}>Requests</Text>
              </View>
            </TouchableOpacity>
          ))}
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
