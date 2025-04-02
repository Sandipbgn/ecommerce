const router = require('express').Router();
const {
    initiatePayment,
    verifyPaymentStatus,
    capturePayment,
    getPaymentById,
    getUserPayments
} = require('../controllers/payment.controller');
const { auth, admin } = require('../middleware/auth.middleware');

/**
 * @route POST /api/checkout/payment
 * @desc Initiate PayPal payment
 * @access Private
 * @body {orderId}
 */
router.post('/payment', auth, initiatePayment);

/**
 * @route GET /api/checkout/payment/status
 * @desc Verify payment status
 * @access Public
 */
router.get('/payment/status', verifyPaymentStatus);

/**
 * @route POST /api/checkout/payment/capture
 * @desc Capture and confirm PayPal payment
 * @access Private
 * @body {transactionId}
 */
router.post('/payment/capture', auth, capturePayment);

module.exports = router;