const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.post('/change-password', auth, authController.changePassword);
router.get('/admins', auth, authController.getAdmins);
router.delete('/users/:id', auth, authController.deleteUser);

module.exports = router;