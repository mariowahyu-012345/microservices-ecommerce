const customerModel = require('../models/customerModel');
// 1. IMPORT FILE queue.js (Sesuaikan path foldernya dengan struktur projectmu)
const { sendEvent } = require('../config/queue'); 

const customerController = {
  // === 1. Mengambil semua data customer ===
  getAllCustomers: async (req, res) => {
    try {
      const customers = await customerModel.findAll(); 
      return res.status(200).json(customers);
    } catch (error) {
      return res.status(500).json({ message: 'Error mengambil semua customer', error: error.message });
    }
  },

  // === 2. Mengambil data customer berdasarkan ID ===
  getCustomerById: async (req, res) => {
    try {
      const customer = await customerModel.findById(req.params.id);
      if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });
      return res.status(200).json(customer);
    } catch (error) {
      return res.status(500).json({ message: 'Error mengambil data customer', error: error.message });
    }
  },

  // === 3. Membuat Customer Baru (Disesuaikan dengan Halaman 2-3 PDF) ===
  createCustomer: async (req, res) => {
    const { userId, name, email, phone, address } = req.body;

    // Validasi input dasar
    if (!userId || !name || !email) {
      return res.status(400).json({ message: "User ID, name, and email are required" });
    }

    try {
      // Simpan ke database customer_db lokal
      const customerId = await customerModel.createCustomer({ userId, name, email, phone, address });

      // KIRIM EVENT KE RABBITMQ: Memicu antrean "CREATE_CUSTOMER" [cite: 482, 483]
      await sendEvent("CREATE_CUSTOMER", {
        id: customerId,
        name: name,
        email: email
      }); 

      // Kirim respons balik ke Postman
      return res.status(201).json({ 
        message: "Customer created successfully", 
        customerId 
      }); 

    } catch (error) {
      console.error("Error creating customer:", error.message); 
      return res.status(500).json({
        message: "Error creating customer",
        error: error.message || error.code
      });
    }
  },

  // === 4. Mengubah Data Customer (Tambahan Sesuai Halaman 3-4 PDF) ===
  updateCustomer: async (req, res) => { 
    const { id } = req.params; 
    const { name, email, phone, address } = req.body; 

    try {
      // Update data di database customer_db lokal
      const affectedRows = await customerModel.updateCustomer(id, { name, email, phone, address });

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Customer not found or no changes made" }); 
      }

      // KIRIM EVENT KE RABBITMQ: Memicu antrean "UPDATE_CUSTOMER" [cite: 519, 520]
      await sendEvent("UPDATE_CUSTOMER", {
        id: id,
        name: name,
        email: email
      }); 

      // Kirim respons balik ke Postman
      return res.status(200).json({ message: "Customer updated successfully" }); 

    } catch (error) {
      console.error("Error updating customer:", error); 
      return res.status(500).json({ message: "Error updating customer", error: error.message }); 
    }
  }
};

module.exports = customerController;