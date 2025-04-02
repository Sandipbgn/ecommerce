// backend/routes/dashboard.routes.js
const router = require('express').Router();
const { getSalesAnalytics } = require('../controllers/dashboard.controller');
const { auth, admin } = require('../middleware/auth.middleware');

/**
 * @route GET /api/admin/dashboard
 * @desc Get sales and inventory analytics
 * @access Private/Admin
 */
router.get('/dashboard', auth, admin, getSalesAnalytics);

module.exports = router;