const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController'); // Baris 3

// Baris 5 (Tempat error tadi terjadi):
router.get('/', customerController.getAllCustomers); 
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);

module.exports = router;