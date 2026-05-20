const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts); // <-- Menampilkan semua produk
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);

module.exports = router;