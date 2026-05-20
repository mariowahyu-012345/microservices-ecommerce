const userModel = require('../models/userModel');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.findAll();
      return res.status(200).json(users);
    } catch (error) {
      console.error("[User Controller Error - GetAll]:", error);
      return res.status(500).json({ message: 'Error mengambil data user', error: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
      return res.status(200).json(user);
    } catch (error) {
      console.error("[User Controller Error - GetById]:", error);
      return res.status(500).json({ message: 'Error mengambil data user', error: error.message });
    }
  },

  registerUser: async (req, res) => {
    const { username, password, role } = req.body;
    
    // Validasi input awal
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }
    
    try {
      console.log("[User Service] Menerima data register:", { username, role });
      const userId = await userModel.create(username, password, role);
      return res.status(201).json({ message: 'User berhasil didaftarkan', userId });
    } catch (error) {
      // INI SANGAT PENTING: Menampilkan error asli di terminal log
      console.error("[User Controller Error - Register]:", error);
      return res.status(500).json({ message: 'Gagal mendaftarkan user', error: error.message });
    }
  }
};

module.exports = userController;