const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Routes prefixed with /api/auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;