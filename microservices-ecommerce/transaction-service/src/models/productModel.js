const db = require('../config/db');

const ProductModel = {
  // Fungsi create replika produk
  create: async (id, name, imageUrl) => {
    const query = 'INSERT INTO products (id, name, image_url) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [id, name, imageUrl]);
    return result;
  },

  // === TAMBAHKAN FUNGSI INI ===
  findById: async (id) => {
    const query = 'SELECT * FROM products WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0]; // Mengembalikan satu data produk
  }
};

module.exports = ProductModel;