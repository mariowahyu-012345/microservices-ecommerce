require('dotenv').config();
const express = require('express');
const app = express();

// PERBAIKAN: Panggil productRoutes, bukan userRoutes!
const productRoutes = require('./routes/productRoutes');

app.use(express.json());

// PERBAIKAN: Gunakan rute /api/products untuk layanan ini
app.use('/api/products', productRoutes);

// Rute dasar opsional agar tidak "Cannot GET /" saat dicek di browser
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Product Service API is running smoothly!'
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Product Service berjalan di port ${PORT}`);
});