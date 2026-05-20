const transactionModel = require('../models/transactionModel');
const axios = require('axios');

// Set konfigurasi default Axios agar maksimal menunggu 5 detik saja (Anti-Hanging)
const http = axios.create({
  timeout: 5000,
  // TAMBAHKAN BARIS INI: Izinkan status 404 lolos agar bisa kita tangani manual di dalam 'if'
  validateStatus: function (status) {
    return status >= 200 && status < 500; 
  }
});
const transactionController = {
  // === 1. Mengambil semua data transaksi ===
  getAllTransactions: async (req, res) => {
    try {
      const transactions = await transactionModel.findAll(); 
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error mengambil semua data transaksi', 
        error: error.message 
      });
    }
  },

  // === 2. Fungsi Membuat Transaksi Baru ===
  createTransaction: async (req, res) => {
    const { customerId, items } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Customer ID dan item transaksi wajib diisi' });
    }

    try {
      console.log("-> [Transaction] Memulai validasi ke Customer Service...");
      // 1. Validasi Customer via Customer Service (Menggunakan instance 'http' dengan timeout)
      const customerResponse = await http.get(`${process.env.CUSTOMER_SERVICE_URL}/api/customers/${customerId}`);
      if (customerResponse.status !== 200 || !customerResponse.data) {
        return res.status(404).json({ message: 'Customer tidak ditemukan' });
      }

      let totalAmount = 0;
      const processedItems = [];

      console.log("-> [Transaction] Memulai validasi produk dan stok...");
      // 2. Validasi Produk & Cek Stok
      for (const item of items) {
        const productResponse = await http.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
        if (productResponse.status !== 200 || !productResponse.data) {
          return res.status(404).json({ message: `Produk dengan ID ${item.productId} tidak ditemukan` });
        }

        const product = productResponse.data;
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Stok tidak cukup untuk produk ${product.name}. Tersisa: ${product.stock}` });
        }

        totalAmount += product.price * item.quantity;
        processedItems.push({ productId: product.id, quantity: item.quantity, pricePerItem: product.price });

        console.log(`-> [Transaction] Mengurangi stok untuk produk ID: ${product.id}`);
        // Kurangi stok produk ke Product Service
        await http.put(`${process.env.PRODUCT_SERVICE_URL}/api/products/${product.id}`, {
          stock: product.stock - item.quantity
        });
      }

      console.log("-> [Transaction] Menyimpan data ke database...");
      // 3. Simpan Transaksi Utama
      const transactionId = await transactionModel.createTransaction(customerId, totalAmount, 'pending');

      // 4. Simpan Item Transaksi
      for (const item of processedItems) {
        await transactionModel.addTransactionItem(transactionId, item.productId, item.quantity, item.pricePerItem);
      }

      console.log("-> [Transaction] Transaksi berhasil dibuat!");
      return res.status(201).json({ message: 'Transaksi berhasil dibuat', transactionId });
    } catch (error) {
      console.log("X [Transaction] Terjadi kesalahan:", error.message);
      return res.status(500).json({ 
        message: 'Error membuat transaksi atau koneksi antar-service terputus', 
        error: error.message 
      });
    }
  },

  // === 3. Fungsi Mengambil Detail Transaksi Berdasarkan ID ===
  getTransactionById: async (req, res) => {
    const { id } = req.params;
    try {
      const transactionItems = await transactionModel.findById(id);
      if (!transactionItems || transactionItems.length === 0) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      }

      const itemsWithProductDetails = await Promise.all(transactionItems.map(async item => {
        try {
          const productResponse = await http.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}`);
          const product = productResponse.data;
          return {
            item_id: item.item_id,
            product_id: item.product_id,
            product_name: product ? product.name : 'Produk Tidak Diketahui',
            quantity: item.quantity,
            price_per_item: item.price_per_item
          };
        } catch {
          return {
            item_id: item.item_id,
            product_id: item.product_id,
            product_name: 'Produk Tidak Diketahui',
            quantity: item.quantity,
            price_per_item: item.price_per_item
          };
        }
      }));

      const transaction = {
        id: transactionItems[0].id,
        customer_id: transactionItems[0].customer_id,
        total_amount: transactionItems[0].total_amount,
        status: transactionItems[0].status,
        transaction_date: transactionItems[0].transaction_date,
        items: itemsWithProductDetails
      };

      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: 'Error mengambil detail transaksi', error: error.message });
    }
  }
};

module.exports = transactionController;