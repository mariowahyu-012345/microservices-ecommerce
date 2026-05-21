const db = require('../config/db');

const CustomerModel = {
  // Fungsi create yang sudah kita perbaiki tadi
  create: async (id, name, email) => {
    const query = 'INSERT INTO customers (id, name, email) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [id, name, email]);
    return result;
  },

  // === TAMBAHKAN FUNGSI INI ===
  findById: async (id) => {
    const query = 'SELECT * FROM customers WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0]; // Mengembalikan satu data customer (atau undefined jika tidak ketemu)
  }
};

module.exports = CustomerModel;