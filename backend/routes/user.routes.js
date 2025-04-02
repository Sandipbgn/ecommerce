const router = require('express').Router();
const { registerUser, loginUser, getMe } = require('../controllers/user.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getMe);

module.exports = router;