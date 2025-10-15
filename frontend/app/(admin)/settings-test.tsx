import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function SettingsTest() {
  const testButton = () => {
    console.log('====== BUTTON PRESSED ======');
    alert('Button works!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Button Test</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testButton}
          onPressIn={() => console.log('PRESS IN')}
          onPressOut={() => console.log('PRESS OUT')}
        >
          <Text style={styles.buttonText}>TEST BUTTON - TAP ME</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: 'red' }]} 
          onPress={() => {
            console.log('INLINE HANDLER WORKS');
            alert('Inline works!');
          }}
        >
          <Text style={styles.buttonText}>INLINE TEST</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
