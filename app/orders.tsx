import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { getOrders } from '../src/db/order.repo';
import { formatCurrency } from '../src/utils/format';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#0B5345',
  background: '#FDFEFE',
  text: '#333',
  textLight: '#777',
  card: '#fff',
  border: '#EAEAEA',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = async () => setOrders(await getOrders());

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderCardHeader}>
        <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
        <Text style={styles.orderId}>Mã đơn #{item.order_id}</Text>
      </View>
      <View style={styles.orderCardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.orderDate}>
            Ngày: {new Date(item.created_at).toLocaleString('vi-VN')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.orderTotal}>
            Tổng cộng: {formatCurrency(item.total)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Lịch sử đơn hàng</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.order_id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 10,
  },
  orderCardBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  orderTotal: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginTop: 10,
  },
});