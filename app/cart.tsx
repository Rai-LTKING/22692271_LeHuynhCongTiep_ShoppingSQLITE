import { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, Pressable, StyleSheet, 
  SafeAreaView, Alert 
} from 'react-native';
import { getCart, updateQty, CartItem } from '../src/db/cart.repo';
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
  danger: '#D9534F'
};

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  const loadCart = async () => {
    const data = await getCart();
    setItems([...data]);
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const changeQty = (id: number, qty: number, stock: number) => {
    if (qty > stock) {
      Toast.show({ type: 'error', text1: 'Vượt quá tồn kho!' });
      return;
    }

    let newItems;
    if (qty <= 0) {
      // Xử lý xoá
      Alert.alert(
        "Xoá sản phẩm",
        "Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng?",
        [
          { text: "Huỷ", style: "cancel" },
          { 
            text: "OK", 
            onPress: () => {
              setItems(items.filter(item => item.id !== id));
              updateQty(id, 0).catch(handleUpdateError);
            }
          }
        ]
      );
    } else {
      // Cập nhật
      newItems = items.map(item =>
        item.id === id ? { ...item, qty: qty } : item
      );
      setItems([...newItems]);
      updateQty(id, qty).catch(handleUpdateError);
    }
  };

  const handleUpdateError = () => {
    Toast.show({ type: 'error', text1: 'Lỗi cập nhật giỏ hàng!' });
    loadCart();
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * (i.price || 0), 0);

  const handleGoToCheckout = () => {
    if (items.length === 0) {
      Toast.show({ type: 'info', text1: 'Giỏ hàng trống!' });
      return;
    }
    router.push('/invoice');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price || 0)}</Text>
        <Text style={styles.itemTotal}>Tổng: {formatCurrency(item.qty * (item.price || 0))}</Text>
      </View>
      <View style={styles.itemControls}>
        <Pressable 
          style={styles.controlButton} 
          onPress={() => changeQty(item.id, item.qty - 1, item.stock || 0)}
        >
          <Ionicons name={item.qty === 1 ? "trash-outline" : "remove-outline"} size={20} color={item.qty === 1 ? COLORS.danger : COLORS.primary} />
        </Pressable>
        <Text style={styles.itemQty}>{item.qty}</Text>
        <Pressable 
          style={styles.controlButton} 
          onPress={() => changeQty(item.id, item.qty + 1, item.stock || 0)}
        >
          <Ionicons name="add-outline" size={20} color={COLORS.primary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 Giỏ hàng</Text>
      </View>

      <FlatList
        data={items}
        extraData={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
            <Pressable onPress={() => router.push('/')} style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Bắt đầu mua sắm</Text>
            </Pressable>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Tạm tính:</Text>
            <Text style={styles.summaryTotal}>{formatCurrency(subtotal)}</Text>
          </View>
          <Pressable
            onPress={handleGoToCheckout}
            style={({ pressed }) => [
              styles.checkoutButton,
              pressed && { opacity: 0.8 }
            ]}
          >
            <Text style={styles.checkoutButtonText}>Đến trang thanh toán</Text>
            <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.textLight,
    marginVertical: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
  },
  controlButton: {
    padding: 8,
  },
  itemQty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 12,
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
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 20,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  summaryTotal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10
  },
});