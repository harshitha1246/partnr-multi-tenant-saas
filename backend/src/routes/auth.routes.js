const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware'); // optional, only for protected routes

// Tenant registration
router.post('/register-tenant', authController.registerTenant);

// Login
router.post('/login', authController.login);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;
