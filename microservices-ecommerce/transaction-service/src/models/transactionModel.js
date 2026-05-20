const pool = require('../config/db');

const transactionModel = {
  // === TAMBAHKAN FUNGSI INI ===
  findAll: async () => {
    // Mengambil semua data dari tabel transaksi utama kamu (misal namanya: transactions)
    const [rows] = await pool.execute('SELECT * FROM transactions ORDER BY id DESC');
    return rows;
  },

  // Fungsi-fungsi transaksi milikmu yang sudah ada sebelumnya
  createTransaction: async (customerId, totalAmount, status) => {
    // ... kode milikmu
  },

  addTransactionItem: async (transactionId, productId, quantity, pricePerItem) => {
    // ... kode milikmu
  },

  findById: async (id) => {
    // ... kode milikmu
  }
};

module.exports = transactionModel;