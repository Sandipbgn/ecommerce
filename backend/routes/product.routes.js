const router = require('express').Router();
const { registerUser, loginUser, getMe } = require('../controllers/user.controller');
const { auth } = require('../middleware/auth.middleware');

/**
 * @route POST /api/product/register
 * @desc Register a new user
 * @access Public
 * @body {name, email, password}
 */
router.post('/register', registerUser);

module.exports = router;