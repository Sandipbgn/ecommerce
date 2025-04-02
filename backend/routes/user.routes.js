const router = require('express').Router();
const { registerUser, loginUser, getMe } = require('../controllers/user.controller');
const { auth } = require('../middleware/auth.middleware');

/**
 * @route POST /api/user/register
 * @desc Register a new user
 * @access Public
 * @body {name, email, password}
 */
router.post('/register', registerUser);

/**
 * @route POST /api/user/login
 * @desc Login a user and get token
 * @access Public
 * @body {email, password}
 */
router.post('/login', loginUser);

/**
 * @route GET /api/user/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', auth, getMe);

/**
 * @route PATCH /api/user/me
 * @desc Update current user profile
 * @access Private
 */
router.patch('/me', auth, (req, res) => { return res.status(200).json({ message: "User updated" }) });

module.exports = router;