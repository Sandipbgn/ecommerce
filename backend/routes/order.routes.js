const router = require('express').Router();
const {
    createOrder,
    getOrders,
    getUserOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/order.controller');
const { auth, admin } = require('../middleware/auth.middleware');

/**
 * @route POST /api/orders
 * @desc Create a new order from cart
 * @access Privat
 */
router.post('/', auth, createOrder);

/**
 * @route GET /api/orders
 * @desc Get all orders (Admin only)
 * @access Private/Admin
 */
router.get('/', auth, admin, getOrders);

/**
 * @route GET /api/orders/user
 * @desc Get logged-in user's orders
 * @access Private
 */
router.get('/user', auth, getUserOrders);

/**
 * @route GET /api/orders/:id
 * @desc Get order details
 * @access Private
 */
router.get('/:id', auth, getOrderById);

/**
 * @route PUT /api/orders/:id/status
 * @desc Update order status (Admin only)
 * @access Private/Admin
 * @body {status}
 */
router.put('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;