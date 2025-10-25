import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('shopping.db');

export const initDb = async () => {

  
  // await db.execAsync('DROP TABLE IF EXISTS order_items');
  // await db.execAsync('DROP TABLE IF EXISTS orders');
  // await db.execAsync('DROP TABLE IF EXISTS cart_items');
  // await db.execAsync('DROP TABLE IF EXISTS products');
  // console.log("ĐÃ XOÁ SẠCH CÁC BẢNG CŨ!");


  await db.execAsync(` 
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS products(
      product_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL CHECK(price>=0),
      stock INTEGER NOT NULL CHECK(stock>=0)
    );
    CREATE TABLE IF NOT EXISTS cart_items(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      qty INTEGER NOT NULL CHECK(qty>0),
      UNIQUE(product_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id)
    );
    CREATE TABLE IF NOT EXISTS orders(
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      total REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id TEXT,
      qty INTEGER,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(order_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id) -- Thêm khoá ngoại này
    );
  `);
};

export default db;