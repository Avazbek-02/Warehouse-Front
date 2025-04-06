const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Routes prefixed with /api/orders
router.get('/', protect, orderController.getOrders);
router.get('/:id', protect, orderController.getOrder);
router.post('/', protect, orderController.createOrder);
router.put('/:id', protect, orderController.updateOrder);
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router; 