require('dotenv').config();
const express = require('express');
const app = express();

const customerRoutes = require('./routes/customerRoutes');

app.use(express.json());
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Customer Service menggunakan server.js berjalan lancar!'
  });
});

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Customer Service berjalan di port ${PORT}`);
});