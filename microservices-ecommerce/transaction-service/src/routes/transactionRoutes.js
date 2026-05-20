const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// 1. Rute GET Massal (Menampilkan semua data transaksi)
router.get('/', transactionController.getAllTransactions);

// 2. Rute POST (Membuat transaksi baru)
router.post('/', transactionController.createTransaction);

// 3. Rute GET Detail Berdasarkan ID Transaksi
router.get('/:id', transactionController.getTransactionById); 

module.exports = router;