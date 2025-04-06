const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const { protect } = require('../middleware/authMiddleware');

// Routes prefixed with /api/credits
router.get('/', protect, creditController.getCredits);
router.get('/:id', protect, creditController.getCredit);
router.post('/', protect, creditController.createCredit);
router.put('/:id', protect, creditController.updateCredit);
router.delete('/:id', protect, creditController.deleteCredit);
router.post('/:id/payment', protect, creditController.addPayment);

module.exports = router; 