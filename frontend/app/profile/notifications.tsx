import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const [settings, setSettings] = React.useState({
    repairUpdates: true,
    promotions: true,
    newProducts: false,
    warrantyExpiry: true,
  });

  const toggleSetting = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="construct" size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Repair Updates</Text>
                <Text style={styles.settingDescription}>
                  Get notified about repair progress and status changes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.repairUpdates}
              onValueChange={() => toggleSetting('repairUpdates')}
              trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
              thumbColor={settings.repairUpdates ? Colors.primary : Colors.textLight}
            />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="pricetag" size={20} color={Colors.secondary} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Promotions & Offers</Text>
                <Text style={styles.settingDescription}>
                  Receive special offers and discount notifications
                </Text>
              </View>
            </View>
            <Switch
              value={settings.promotions}
              onValueChange={() => toggleSetting('promotions')}
              trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
              thumbColor={settings.promotions ? Colors.primary : Colors.textLight}
            />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="cube" size={20} color={Colors.info} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>New Products</Text>
                <Text style={styles.settingDescription}>
                  Be the first to know about new parts and products
                </Text>
              </View>
            </View>
            <Switch
              value={settings.newProducts}
              onValueChange={() => toggleSetting('newProducts')}
              trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
              thumbColor={settings.newProducts ? Colors.primary : Colors.textLight}
            />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.warning} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Warranty Expiry</Text>
                <Text style={styles.settingDescription}>
                  Reminders when your warranty is about to expire
                </Text>
              </View>
            </View>
            <Switch
              value={settings.warrantyExpiry}
              onValueChange={() => toggleSetting('warrantyExpiry')}
              trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
              thumbColor={settings.warrantyExpiry ? Colors.primary : Colors.textLight}
            />
          </View>
        </View>

        <Text style={styles.infoText}>
          You can manage your notification preferences anytime. Changes will take effect immediately.
        </Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
});
