import db from './db';
import { Product } from '../models/types';

export interface CartItem {
  id: number;
  product_id: string;
  qty: number;
  name?: string;
  price?: number;
  stock?: number;
}

export const addToCart = async (productId: string) => {
  const product = (await db.getFirstAsync(
    'SELECT * FROM products WHERE product_id=?',
    [productId]
  )) as Product | null;

  if (!product) throw new Error('Sản phẩm không tồn tại!');

  const cartItem = (await db.getFirstAsync(
    'SELECT * FROM cart_items WHERE product_id=?',
    [productId]
  )) as CartItem | null;

  if (cartItem) {
    if (cartItem.qty < product.stock) {
      await db.runAsync(
        'UPDATE cart_items SET qty = qty + 1 WHERE product_id=?',
        [productId]
      );
    } else {
      throw new Error('Vượt quá tồn kho!');
    }
  } else {
    if (product.stock > 0) {
      await db.runAsync(
        'INSERT INTO cart_items (product_id, qty) VALUES (?,1)',
        [productId]
      );
    } else {
      throw new Error('Sản phẩm đã hết hàng!');
    }
  }
};

export const getCart = async (): Promise<CartItem[]> => {
  return (await db.getAllAsync(`
    SELECT c.id, c.product_id, p.name, p.price, c.qty, p.stock 
    FROM cart_items c 
    JOIN products p ON c.product_id = p.product_id
  `)) as CartItem[];
};

export const updateQty = async (id: number, qty: number) => {
  if (qty <= 0) {
    await db.runAsync('DELETE FROM cart_items WHERE id=?', [id]);
  } else {
    await db.runAsync('UPDATE cart_items SET qty=? WHERE id=?', [qty, id]);
  }
};