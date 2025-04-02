const router = require('express').Router();
const {
    getPaymentById,
    getUserPayments
} = require('../controllers/payment.controller');
const { auth, admin } = require('../middleware/auth.middleware');

/**
 * @route GET /api/payments/:id
 * @desc Get payment details
 * @access Private/Admin
 */
router.get('/:id', auth, admin, getPaymentById);

/**
 * @route GET /api/payments/user
 * @desc Get user's payment history
 * @access Private
 */
router.get('/user', auth, getUserPayments);

module.exports = router;