import db from './db';
import { CartItem } from './cart.repo'; 

export const createOrder = async (cartItems: CartItem[], total: number) => {
  try {
    await db.withTransactionAsync(async () => {
      const result = await db.runAsync('INSERT INTO orders (total) VALUES (?)', [total]);
      const orderId = result.lastInsertRowId;

      for (const item of cartItems) {
        const product = await db.getFirstAsync(
          'SELECT stock FROM products WHERE product_id=?',
          [item.product_id]
        ) as { stock: number } | null;

        if (!product || product.stock < item.qty) {
          throw new Error(`Sản phẩm ${item.name || item.product_id} không đủ hàng!`);
        }

        await db.runAsync(
          'INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?,?,?,?)',
          [orderId, item.product_id, item.qty, item.price ?? null] // <--- SỬA LỖI Ở ĐÂY
        );

        await db.runAsync(
          'UPDATE products SET stock = stock - ? WHERE product_id=?',
          [item.qty, item.product_id]
        );
      }

      await db.runAsync('DELETE FROM cart_items');
    });
  } catch (err) {
    console.error('Transaction thất bại:', err);
    throw err; 
  }
};

export const getOrders = async () => {
  return db.getAllAsync('SELECT * FROM orders ORDER BY created_at DESC');
};

export const getOrderItems = async (orderId: number) => {
  return db.getAllAsync(`
    SELECT o.id, p.name, o.qty, o.price 
    FROM order_items o 
    JOIN products p ON o.product_id = p.product_id
    WHERE o.order_id=?
  `, [orderId]);
};