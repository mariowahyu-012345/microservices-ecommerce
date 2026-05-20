require('dotenv').config();
const express = require('express');
const app = express();

// PERBAIKAN: Panggil customerRoutes, bukan userRoutes!
const customerRoutes = require('./routes/customerRoutes');

app.use(express.json());

// PERBAIKAN: Gunakan rute /api/customers untuk layanan ini
app.use('/api/customers', customerRoutes);

// Rute dasar opsional agar aman saat dicek lewat browser/gateway
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Customer Service API is running smoothly!'
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Customer Service berjalan di port ${PORT}`);
});