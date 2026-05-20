require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes'); // Hubungkan rute baru

app.use(express.json());
app.use('/api/users', userRoutes); // Daftarkan rute utama

// Tambahkan ini agar saat dibuka di browser tidak "Cannot GET /"
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User Service API is running smoothly!'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Service berjalan di port ${PORT}`));