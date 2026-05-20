const pool = require('../config/db');

const productModel = {
  // === TAMBAHKAN FUNGSI INI ===
  findAll: async () => {
    // Mengambil semua data produk dari tabel products
    const [rows] = await pool.execute('SELECT * FROM products');
    return rows;
  },

  // Fungsi findById yang sudah ada di kodemu
  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  // Fungsi create yang sudah sukses sebelumnya
  create: async (productData) => {
    // ... kode create milikmu
  }
};

module.exports = productModel;