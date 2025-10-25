import { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, Button, Alert, 
  SafeAreaView, StyleSheet, ScrollView, Pressable 
} from 'react-native';
import { getCart, CartItem } from '../src/db/cart.repo';
import { createOrder } from '../src/db/order.repo';
import Toast from 'react-native-toast-message';
import { formatCurrency } from '../src/utils/format';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#0B5345',
  background: '#FDFEFE',
  text: '#333',
  textLight: '#777',
  card: '#fff',
  border: '#EAEAEA',
};

export default function InvoiceScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  const loadCart = async () => setItems(await getCart());

  useFocusEffect(
    useCallback(() => {
      loadCart();
      if (items.length === 0) {
        // Nếu giỏ hàng trống thì không ở lại trang này
        // router.replace('/cart'); 
      }
    }, [])
  );

  const subtotal = items.reduce((sum, i) => sum + i.qty * (i.price || 0), 0);
  const vat = subtotal * 0.1; // Giả sử VAT 10%
  const total = subtotal + vat;

  const handleCheckout = async () => {
    if (items.length === 0) {
      Toast.show({ type: 'info', text1: 'Giỏ hàng trống!' });
      router.replace('/cart');
      return;
    }

    Alert.alert('Xác nhận đặt hàng', 'Bạn có chắc chắn muốn đặt hàng không?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            await createOrder(items, total);
            Toast.show({ type: 'success', text1: 'Đặt hàng thành công!' });
            loadCart();
            router.replace('/orders'); // Chuyển đến trang Lịch sử đơn hàng
          } catch (e: any) {
            Toast.show({ type: 'error', text1: e.message });
            console.error(e);
          }
        },
      },
    ]);
  };

  const renderInvoiceItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemQty}>{item.qty} ×</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>@{formatCurrency(item.price || 0)}</Text>
      </View>
      <Text style={styles.itemTotal}>{formatCurrency(item.qty * (item.price || 0))}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧾 Xác nhận đơn hàng</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderInvoiceItem}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={<Text style={styles.listHeader}>Chi tiết sản phẩm</Text>}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có sản phẩm để thanh toán.</Text>
        }
      />

      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tổng kết</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (10%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(vat)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text>
          </View>

          <Pressable
            onPress={handleCheckout}
            style={({ pressed }) => [
              styles.checkoutButton,
              pressed && { opacity: 0.8 }
            ]}
          >
            <Text style={styles.checkoutButtonText}>Xác nhận đặt hàng</Text>
          </Pressable>
        </View>
      )}
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
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemQty: {
    fontSize: 16,
    color: COLORS.textLight,
    marginRight: 10,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.textLight,
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});