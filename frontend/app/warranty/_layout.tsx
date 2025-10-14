import React from 'react';
import { Stack } from 'expo-router';

export default function WarrantyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="check" />
    </Stack>
  );
}
