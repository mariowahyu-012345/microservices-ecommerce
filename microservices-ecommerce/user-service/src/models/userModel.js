const pool = require('../config/db');

const userModel = {
  findAll: async () => {
    const [rows] = await pool.execute('SELECT id, username, role, created_at FROM users');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT id, username, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (username, password, role) => {
    // TAMBAHKAN LOG INI UNTUK MEMASTIKAN APAKAH KODE SAMPAI DI SINI
    console.log("[User Model] Mencoba menjalankan query INSERT ke database...");
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role || 'customer']
    );
    
    console.log("[User Model] Query database berhasil!");
    return result.insertId;
  }
};

module.exports = userModel;