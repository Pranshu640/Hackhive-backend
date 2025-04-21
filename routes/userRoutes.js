const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/all', userController.getAllUsers);

// Protected routes
router.use(authController.protect);
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

module.exports = router;