import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native'; 
import { initDb } from '../src/db/db';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

// Định nghĩa màu sắc chủ đạo
const COLORS = {
  primary: '#0B5345', // Xanh đậm
  inactive: '#707070',
  background: '#FDFEFE',
  loading: '#0B5345',
};

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initDb();
        setDbInitialized(true);
      } catch (e) {
        console.error("Lỗi khởi tạo database:", e);
      }
    })();
  }, []);

  if (!dbInitialized) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <StatusBar style="dark" /> 
        <ActivityIndicator size="large" color={COLORS.loading} />
        <Text style={{ marginTop: 10, color: COLORS.loading }}>Đang tải dữ liệu cửa hàng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}> 
      <StatusBar style="dark" /> 
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          tabBarStyle: { 
            height: 60, 
            paddingBottom: 30, 
            paddingTop: 6,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0'
          },
          tabBarLabelStyle: {
            fontWeight: '600'
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Cửa hàng',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fast-food-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Giỏ hàng',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="basket-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="invoice"
          options={{
            title: 'Thanh toán',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Đơn hàng',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="archive-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <Toast />
    </SafeAreaView> 
  );
}