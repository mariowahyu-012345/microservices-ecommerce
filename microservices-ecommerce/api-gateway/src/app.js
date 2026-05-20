require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy'); // Menggunakan pustaka baru yang anti-gantung
const app = express();
const PORT = process.env.PORT || 3000;

// API Gateway aman membaca JSON secara global dengan pustaka ini
app.use(express.json());

// ==================== ROUTING PROXY TUNGGAL (PORT 3000) ====================

// 1. Meneruskan ke User Service (Port 3001)
app.use('/api/users', proxy(process.env.USER_SERVICE_URL || 'http://localhost:3001', {
  proxyReqPathResolver: (req) => {
    return `/api/users${req.url}`; // Memastikan path URL diteruskan dengan benar
  }
}));

// 2. Meneruskan ke Customer Service (Port 3002)
app.use('/api/customers', proxy(process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002', {
  proxyReqPathResolver: (req) => {
    return `/api/customers${req.url}`;
  }
}));

// 3. Meneruskan ke Product Service (Port 3003)
app.use('/api/products', proxy(process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003', {
  proxyReqPathResolver: (req) => {
    return `/api/products${req.url}`;
  }
}));

// 4. Meneruskan ke Transaction Service (Port 3004)
app.use('/api/transactions', proxy(process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004', {
  proxyReqPathResolver: (req) => {
    return `/api/transactions${req.url}`;
  }
}));

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API Gateway Port 3000 lancar jaya!' });
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`=== API GATEWAY FIXED & RUNNING ON PORT ${PORT} ===`);
  console.log(`=============================================`);
});