import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  const router = useRouter();

  const contactOptions = [
    {
      id: '1',
      icon: 'call',
      title: 'Call Us',
      description: '+94 77 123 4567',
      action: () => Linking.openURL('tel:+94771234567'),
    },
    {
      id: '2',
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      description: 'Chat with support',
      action: () => Linking.openURL('https://wa.me/94771234567'),
    },
    {
      id: '3',
      icon: 'mail',
      title: 'Email',
      description: 'info@wefix.lk',
      action: () => Linking.openURL('mailto:info@wefix.lk'),
    },
    {
      id: '4',
      icon: 'globe',
      title: 'Website',
      description: 'Visit wefix.lk',
      action: () => Linking.openURL('https://wefix.lk'),
    },
  ];

  const faqs = [
    {
      id: '1',
      question: 'How long does a repair take?',
      answer: 'Most repairs are completed within 2-3 business days.',
    },
    {
      id: '2',
      question: 'Do you provide warranty on repairs?',
      answer: 'Yes, all repairs come with a 90-day warranty.',
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery (COD) for all services.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {contactOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.contactCard}
            onPress={option.action}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={option.icon as any} size={24} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq) => (
          <View key={faq.id} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={24} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Working Hours</Text>
            <Text style={styles.infoText}>Monday - Saturday: 9:00 AM - 6:00 PM</Text>
            <Text style={styles.infoText}>Sunday: Closed</Text>
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  faqCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
});
