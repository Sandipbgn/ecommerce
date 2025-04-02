// backend/routes/cart.routes.js
const router = require('express').Router();
const {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../controllers/cart.controller');
const { auth } = require('../middleware/auth.middleware');

/**
 * @route POST /api/cart/add
 * @desc Add product to cart
 * @access Private
 * @body {productId, quantity}
 */
router.post('/add', auth, addToCart);

/**
 * @route GET /api/cart
 * @desc Get cart items
 * @access Private
 */
router.get('/', auth, getCart);

/**
 * @route PUT /api/cart/update/:id
 * @desc Update cart item quantity
 * @access Private
 * @body {quantity}
 */
router.put('/update/:id', auth, updateCartItem);

/**
 * @route DELETE /api/cart/remove/:id
 * @desc Remove item from cart
 * @access Private
 */
router.delete('/remove/:id', auth, removeCartItem);

/**
 * @route DELETE /api/cart/clear
 * @desc Clear entire cart
 * @access Private
 */
router.delete('/clear', auth, clearCart);

module.exports = router;