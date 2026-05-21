require('dotenv').config();
const express = require('express');
const app = express();

// 1. IMPORT fungsi listenEvent dan Model Produk Utama
const { listenEvent } = require('./config/queue');
const productModel = require('./models/productModel'); 
const productRoutes = require('./routes/productRoutes');

app.use(express.json());

// 2. Gunakan rute produk
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Product Service API is running smoothly!'
  });
});

const PORT = process.env.PORT || 3003; 
app.listen(PORT, () => {
  console.log(`Product Service berjalan di port ${PORT}`);

  // 3. LISTEN EVENT UNTUK PENGURANGAN STOK (Halaman 16 PDF)
  console.log("-> [RabbitMQ] Product Service siap mendengarkan antrean stok...");
  
  listenEvent("UPDATE_PRODUCT_STOCK", async (data) => {
    try {
      // Pastikan method 'reduceStock' atau sejenisnya sudah ada di models/productModel.js kamu
      await productModel.reduceStock(data.id, data.stock); 
      console.log(`[RabbitMQ] Berhasil mengurangi stok produk ID: ${data.id} sebanyak ${data.stock}`);
    } catch (err) {
      console.error("[RabbitMQ] Gagal memperbarui stok via event:", err.message);
    }
  });
});