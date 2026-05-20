const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/register', UserController.registerUser); // Diuji lewat API Gateway nanti

module.exports = router;