const db = require('../config/db'); // Pastikan koneksi DB kamu sudah benar

const transactionModel = {
  
  // Fungsi getAll yang sudah kita perbaiki sebelumnya
  getAll: async () => {
    const query = 'SELECT * FROM transactions'; 
    const [rows] = await db.execute(query);
    return rows;
  },

  // === 1. PASTIKAN FUNGSI INI ADA DAN NAMANYA SAMA PERSIS ===
  createTransaction: async (customerId, totalAmount, status) => {
    try {
      const query = `
        INSERT INTO transactions (customer_id, total_amount, status, transaction_date) 
        VALUES (?, ?, ?, NOW())
      `;
      const [result] = await db.execute(query, [customerId, totalAmount, status]);
      
      // Mengembalikan ID transaksi yang baru saja dibuat agar bisa dipakai oleh item transaksi
      return result.insertId; 
    } catch (error) {
      throw error;
    }
  },

  // === 2. SEKALIGUS PASTIKAN FUNGSI ITEM INI JUGA ADA ===
  addTransactionItem: async (transactionId, productId, quantity, pricePerItem) => {
    try {
      const query = `
        INSERT INTO transaction_items (transaction_id, product_id, quantity, price_per_item) 
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.execute(query, [transactionId, productId, quantity, pricePerItem]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Fungsi-fungsi lain seperti findById, findByCustomerId, dll...
};

// PASTIKAN LINE INI ADA DI PALING BAWAH FILE
module.exports = transactionModel;