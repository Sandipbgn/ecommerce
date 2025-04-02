const router = require('express').Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller');
const { auth, admin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

/**
 * @route GET /api/products
 * @desc Get all products with pagination and filtering
 * @access Public
 */
router.get('/', getProducts);

/**
 * @route GET /api/products/:id
 * @desc Get a single product by ID
 * @access Public
 */
router.get('/:id', getProductById);

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Private/Admin
 * @body {name, description, price, stock, category}
 * @file {image}
 */
router.post('/', auth, admin, upload.single('image'), createProduct);

/**
 * @route PUT /api/products/:id
 * @desc Update a product
 * @access Private/Admin
 * @body {name, description, price, stock, category}
 * @file {image}
 */
router.put('/:id', auth, admin, upload.single('image'), updateProduct);

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product
 * @access Private/Admin
 */
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;