import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  serviceRequests: number;
}

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    inProgressBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    serviceRequests: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Quick Actions Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Add Product Form
  const [productName, setProductName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Notification Form
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const navigateToBookings = (filter?: string) => {
    if (filter) {
      router.push({
        pathname: '/(admin)/bookings',
        params: { filter },
      });
    } else {
      router.push('/(admin)/bookings');
    }
  };

  const navigateToServiceRequests = () => {
    router.push('/(admin)/requests');
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load all bookings - try both storage keys
      let bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (!bookingsJson) {
        bookingsJson = await AsyncStorage.getItem('bookings');
      }
      const bookings = bookingsJson ? JSON.parse(bookingsJson) : [];
      console.log('📊 Dashboard loaded bookings:', bookings.length);

      // Load service requests
      const requestsJson = await AsyncStorage.getItem('service_requests');
      const requests = requestsJson ? JSON.parse(requestsJson) : [];

      // Calculate stats - updated to match the 7 status options
      const pending = bookings.filter((b: any) => b.status === 'pending').length;
      const inProgress = bookings.filter((b: any) => b.status === 'in-progress').length;
      const completed = bookings.filter((b: any) => b.status === 'completed').length;
      const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pending,
        inProgressBookings: inProgress,
        completedBookings: completed,
        cancelledBookings: cancelled,
        serviceRequests: requests.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  // Image picker for products
  const pickImage = async () => {
    if (productImages.length >= 4) {
      Alert.alert('Limit Reached', 'You can only upload up to 4 images per product.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProductImages([...productImages, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  // Add Product Handler
  const handleAddProduct = async () => {
    if (!productName || !modelNumber || !category || !price || !stock) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const productId = `product_${Date.now()}`;
      const newProduct = {
        id: productId,
        name: productName,
        modelNumber,
        category,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        images: productImages,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      // Save to local storage
      const productsJson = await AsyncStorage.getItem('admin_products');
      const products = productsJson ? JSON.parse(productsJson) : [];
      products.push(newProduct);
      await AsyncStorage.setItem('admin_products', JSON.stringify(products));

      console.log('✅ Product added successfully:', newProduct.name);

      // Reset form
      setProductName('');
      setModelNumber('');
      setCategory('');
      setDescription('');
      setPrice('');
      setStock('');
      setProductImages([]);
      setShowAddProductModal(false);

      Alert.alert('Success', '✅ Product added successfully and published!');
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Send Notification Handler
  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      Alert.alert('Missing Information', 'Please provide both title and message.');
      return;
    }

    setIsSendingNotification(true);
    try {
      const notification = {
        id: `notif_${Date.now()}`,
        title: notificationTitle,
        message: notificationMessage,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'admin_broadcast',
      };

      // Load existing notifications
      const notificationsJson = await AsyncStorage.getItem('customer_notifications');
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      notifications.push(notification);
      await AsyncStorage.setItem('customer_notifications', JSON.stringify(notifications));

      console.log('📢 Notification sent to all users');

      // Reset form
      setNotificationTitle('');
      setNotificationMessage('');
      setShowNotificationModal(false);

      Alert.alert('Success', '✅ Notification sent to all users!');
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification. Please try again.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Export Reports Handler
  const handleExportReports = async () => {
    setIsExporting(true);
    try {
      // Load bookings
      let bookingsJson = await AsyncStorage.getItem('local_bookings');
      if (!bookingsJson) {
        bookingsJson = await AsyncStorage.getItem('bookings');
      }
      const bookings = bookingsJson ? JSON.parse(bookingsJson) : [];

      // Load products
      const productsJson = await AsyncStorage.getItem('admin_products');
      const products = productsJson ? JSON.parse(productsJson) : [];

      // Create CSV content
      let csvContent = 'BOOKINGS REPORT\n\n';
      csvContent += 'ID,Customer Name,Phone,TV Brand,Model,Issue,Status,Service Type,Address,Created At\n';
      
      bookings.forEach((b: any) => {
        csvContent += `"${b.id}","${b.customerName || 'N/A'}","${b.customerPhone || b.phone || 'N/A'}","${b.tvBrand}","${b.tvModel}","${b.issueType}","${b.status}","${b.serviceType || b.pickupOption || 'N/A'}","${b.address}","${b.createdAt}"\n`;
      });

      csvContent += '\n\nPRODUCTS REPORT\n\n';
      csvContent += 'ID,Name,Model Number,Category,Price,Stock,Created At\n';
      
      products.forEach((p: any) => {
        csvContent += `"${p.id}","${p.name}","${p.modelNumber}","${p.category}","${p.price}","${p.stock}","${p.createdAt}"\n`;
      });

      // Save file
      const fileName = `WeFix_Report_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('📊 Report exported to:', fileUri);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export WeFix Reports',
          UTI: 'public.comma-separated-values-text',
        });
        Alert.alert('Success', '✅ Report exported and ready to share!');
      } else {
        Alert.alert('Success', `✅ Report saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting reports:', error);
      Alert.alert('Error', 'Failed to export reports. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back, Admin!</Text>
            <Text style={styles.email}>{userProfile?.email}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.textWhite} />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Dashboard Overview</Text>
          
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="construct"
            color={Colors.primary}
            onPress={() => navigateToBookings()}
          />

          <StatCard
            title="Pending Repairs"
            value={stats.pendingBookings}
            icon="time"
            color={Colors.warning}
            onPress={() => navigateToBookings('pending')}
          />

          <StatCard
            title="In Progress"
            value={stats.inProgressBookings}
            icon="hammer"
            color={Colors.info}
            onPress={() => navigateToBookings('in-progress')}
          />

          <StatCard
            title="Completed"
            value={stats.completedBookings}
            icon="checkmark-circle"
            color={Colors.success}
            onPress={() => navigateToBookings('completed')}
          />

          <StatCard
            title="Cancelled"
            value={stats.cancelledBookings}
            icon="close-circle"
            color={Colors.error}
            onPress={() => navigateToBookings('cancelled')}
          />

          <StatCard
            title="New Service Requests"
            value={stats.serviceRequests}
            icon="layers"
            color="#6F42C1"
            onPress={navigateToServiceRequests}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowAddProductModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="cube" size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Add Product</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowNotificationModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={24} color={Colors.secondary} />
            <Text style={styles.actionButtonText}>Send Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleExportReports}
            activeOpacity={0.7}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={Colors.info} />
            ) : (
              <Ionicons name="download" size={24} color={Colors.info} />
            )}
            <Text style={styles.actionButtonText}>
              {isExporting ? 'Exporting...' : 'Export Reports'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Navigate to other tabs to manage bookings, warranty checks, and service requests.
          </Text>
        </View>
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={showAddProductModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity onPress={() => setShowAddProductModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  value={productName}
                  onChangeText={setProductName}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Model Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter model number"
                  value={modelNumber}
                  onChangeText={setModelNumber}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., TV Parts, Accessories"
                  value={category}
                  onChangeText={setCategory}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Product description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price (LKR) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Stock *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Images (up to 4)</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Ionicons name="images" size={24} color={Colors.primary} />
                  <Text style={styles.imagePickerText}>Upload Image</Text>
                </TouchableOpacity>

                <View style={styles.imageGrid}>
                  {productImages.map((image, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image source={{ uri: image }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSavingProduct && styles.submitButtonDisabled]}
                onPress={handleAddProduct}
                disabled={isSavingProduct}
              >
                {isSavingProduct ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitButtonText}>Add Product</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Send Notification Modal */}
      <Modal visible={showNotificationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Notification</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Notification title"
                  value={notificationTitle}
                  onChangeText={setNotificationTitle}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notification message"
                  value={notificationMessage}
                  onChangeText={setNotificationMessage}
                  multiline
                  numberOfLines={6}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={Colors.info} />
                <Text style={styles.infoBoxText}>
                  This notification will be sent to all registered users.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSendingNotification && styles.submitButtonDisabled]}
                onPress={handleSendNotification}
                disabled={isSendingNotification}
              >
                {isSendingNotification ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitButtonText}>Send to All Users</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  email: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  adminBadgeText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
