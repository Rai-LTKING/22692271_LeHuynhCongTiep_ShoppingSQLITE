import db from './db';
import { Product } from '../models/types';

export const seedProducts = async () => {
  const rows = await db.getAllAsync('SELECT * FROM products');
  if (rows.length === 0) {
    await db.runAsync(`
      INSERT INTO products (product_id, name, price, stock)
      VALUES 
            ('p1','Hạt Cà phê Arabica',250000,50),
            ('p2','Trà Oolong Thượng Hạng',180000,30),
            ('p3','Mật ong hoa nhãn',320000,20),
            ('p4','Phô mai Camembert',150000,15),
            ('p5','Xúc xích Salami Ý',280000,25),
            ('p6','Bánh mì Sourdough',80000,40),
            ('p7','Dầu Olive Extra Virgin',190000,30),
            ('p8','Chocolate Đen 85%',120000,50),
            ('p9','Rượu vang đỏ Chile',450000,12),
            ('p10','Bột Matcha Nhật Bản',300000,18),
            ('p11','Hạt Dinh Dưỡng Mix',170000,40),
            ('p12','Nấm Truffle Đen',950000,5),
            ('p13','Sốt Pesto Tươi',95000,22),
            ('p14','Cá Hồi Xông Khói',220000,15),
            ('p15','Mứt dâu tằm',75000,30)
    `);
  }
};

export const getProducts = async (keyword?: string, min?: number, max?: number): Promise<Product[]> => {
  let sql = 'SELECT * FROM products WHERE 1=1 AND stock > 0';
  const params: any[] = [];
  if (keyword) {
    sql += ' AND name LIKE ?';
    params.push(`%${keyword}%`);
  }
  if (min) {
    sql += ' AND price >= ?';
    params.push(min);
  }
  if (max) {
    sql += ' AND price <= ?';
    params.push(max);
  }
  sql += ' ORDER BY name'; // Sắp xếp theo tên
  return (await db.getAllAsync(sql, params)) as Product[];
};