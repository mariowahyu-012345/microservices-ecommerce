require('dotenv').config();
const express = require('express');
const app = express();

// PERBAIKAN: Panggil transactionRoutes, bukan userRoutes!
const transactionRoutes = require('./routes/transactionRoutes');

app.use(express.json());

// PERBAIKAN: Gunakan rute /api/transactions
app.use('/api/transactions', transactionRoutes);

// Rute dasar opsional agar tidak "Cannot GET /" saat dibuka di browser
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Transaction Service API is running smoothly!'
  });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Transaction Service berjalan di port ${PORT}`);
});