require('dotenv').config();
const express = require('express');
const app = express();

// 1. IMPORT fungsi listenEvent dan Model Replikasi Lokal
const { listenEvent } = require('./config/queue');
const CustomerModel = require('./models/customerModel');
const ProductModel = require('./models/productModel');

const transactionRoutes = require('./routes/transactionRoutes');

app.use(express.json());
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Transaction Service API is running smoothly!'
  });
});

const PORT = process.env.PORT || 3004;

// 2. JALANKAN SERVER EXPRESS TERLEBIH DAHULU
app.listen(PORT, () => {
  console.log(`Transaction Service berjalan di port ${PORT}`);
  
  // 3. REGISTRASI LISTENERS RABBITMQ (Halaman 16-17 PDF)
  // Fungsi ini akan berjalan di background untuk menangkap data dari service lain
  console.log("-> [RabbitMQ] Transaction Service mulai mendengarkan antrean...");

  listenEvent("CREATE_CUSTOMER", async (data) => {
    try {
      await CustomerModel.create(data.id, data.name, data.email);
      console.log(`[RabbitMQ] Sukses mereplikasi Customer Baru ID: ${data.id}`);
    } catch (err) {
      console.error("[RabbitMQ] Gagal menyimpan replikasi customer:", err.message);
    }
  });

  listenEvent("UPDATE_CUSTOMER", async (data) => {
    try {
      await CustomerModel.update(data.id, data.name, data.email);
      console.log(`[RabbitMQ] Sukses memperbarui replikasi Customer ID: ${data.id}`);
    } catch (err) {
      console.error("[RabbitMQ] Gagal memperbarui replikasi customer:", err.message);
    }
  });

  listenEvent("CREATE_PRODUCT", async (data) => {
    try {
      // data.imageUrl disesuaikan dengan properti camelCase dari produser sebelumnya
      await ProductModel.create(data.id, data.name, data.imageUrl);
      console.log(`[RabbitMQ] Sukses mereplikasi Produk Baru ID: ${data.id}`);
    } catch (err) {
      console.error("[RabbitMQ] Gagal menyimpan replikasi produk:", err.message);
    }
  });

  listenEvent("UPDATE_PRODUCT", async (data) => {
    try {
      await ProductModel.update(data.id, data.name, data.imageUrl);
      console.log(`[RabbitMQ] Sukses memperbarui replikasi Produk ID: ${data.id}`);
    } catch (err) {
      console.error("[RabbitMQ] Gagal memperbarui replikasi produk:", err.message);
    }
  });
});