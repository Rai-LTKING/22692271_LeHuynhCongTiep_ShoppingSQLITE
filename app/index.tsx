import { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TextInput, Pressable, StyleSheet, 
  SafeAreaView, ActivityIndicator 
} from 'react-native';
import { getProducts, seedProducts } from '../src/db/product.repo';
import { addToCart, getCart } from '../src/db/cart.repo';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';
import { Product } from '../src/models/types';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../src/utils/format';

const COLORS = {
  primary: '#0B5345',
  secondary: '#1ABC9C',
  background: '#FDFEFE',
  text: '#333',
  textLight: '#777',
  card: '#fff',
  border: '#EAEAEA',
  disabled: '#D0D0D0',
};

export default function ProductScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedProducts();
  }, []);

  const loadProducts = async (searchKeyword: string) => {
    setLoading(true);
    try {
      const dbProducts = await getProducts(searchKeyword);
      const cartItems = await getCart();
      const cartMap = new Map(cartItems.map(item => [item.product_id, item.qty]));

      const availableProducts = dbProducts.map(p => ({
        ...p,
        stock: p.stock - (cartMap.get(p.product_id) || 0)
      }));

      setProducts(availableProducts);
    } catch (e) {
      console.error("Lỗi loadProducts:", e);
      Toast.show({ type: 'error', text1: 'Không thể tải sản phẩm' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts(keyword);
    }, [])
  );

  // Debounce search
  useEffect(() => {
    const timerId = setTimeout(() => {
      loadProducts(keyword);
    }, 300);
    return () => {
      clearTimeout(timerId);
    };
  }, [keyword]);

  const handleAdd = async (id: string) => {
    try {
      await addToCart(id);
      Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ!' });
      await loadProducts(keyword);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message });
      await loadProducts(keyword);
    }
  };

  // Đã xoá phần hiển thị ảnh (placeholder) khỏi đây
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
      <Text style={styles.cardStock}>(Còn {item.stock} sản phẩm)</Text>
      
      <Pressable
        onPress={() => handleAdd(item.product_id)}
        disabled={item.stock === 0}
        style={({ pressed }) => [
          styles.addButton,
          item.stock === 0 ? styles.addButtonDisabled : null,
          pressed && { opacity: 0.7 }
        ]}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={styles.addButtonText}>Thêm</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
          <TextInput
            placeholder="Tìm trà, cà phê, phô mai..."
            value={keyword}
            onChangeText={setKeyword}
            style={styles.searchInput}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          extraData={products}
          keyExtractor={(item) => item.product_id}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>}
        />
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
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  gridContainer: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Đã xoá style 'cardImage'
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    minHeight: 40,
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  cardStock: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.textLight,
  }
});