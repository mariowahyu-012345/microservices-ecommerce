const pool = require('../config/db'); // Sesuaikan dengan konfigurasi database kamu

const customerModel = {
  // === TAMBAHKAN FUNGSI INI ===
  findAll: async () => {
    // Mengambil semua kolom dari tabel customers
    const [rows] = await pool.execute('SELECT * FROM customers');
    return rows;
  },

  // Ini adalah fungsi findById yang mungkin sudah ada di kodemu sebelumnya
  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
    return rows[0];
  },

  // Ini adalah fungsi create yang sudah sukses sebelumnya
  createCustomer: async (customerData) => {
    // ... kode simpan customer milikmu
  }
};

module.exports = customerModel;