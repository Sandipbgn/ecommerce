const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

// Add product to cart
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!productId) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock available');
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
        where: {
            userId,
            productId
        }
    });

    let cartItem;

    if (existingCartItem) {
        // Update quantity if item already in cart
        cartItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: {
                quantity: existingCartItem.quantity + quantity
            },
            include: {
                product: true
            }
        });
    } else {
        // Add new item to cart
        cartItem = await prisma.cartItem.create({
            data: {
                userId,
                productId,
                quantity
            },
            include: {
                product: true
            }
        });
    }

    res.status(200).json({
        message: 'Product added to cart',
        data: cartItem
    });
});

// Get cart items
const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId
        },
        include: {
            product: true
        }
    });

    // Calculate total price
    const total = cartItems.reduce((sum, item) => {
        return sum + (item.quantity * item.product.price);
    }, 0);

    res.status(200).json({
        message: 'Cart retrieved successfully',
        data: {
            items: cartItems,
            total
        }
    });
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id,
            userId
        },
        include: {
            product: true
        }
    });

    if (!cartItem) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    // Verify product has enough stock
    if (quantity > cartItem.product.stock) {
        res.status(400);
        throw new Error('Not enough stock available');
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
        where: { id },
        data: {
            quantity
        },
        include: {
            product: true
        }
    });

    res.status(200).json({
        message: 'Cart item updated',
        data: updatedCartItem
    });
});

// Remove item from cart
const removeCartItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id,
            userId
        }
    });

    if (!cartItem) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    // Delete cart item
    await prisma.cartItem.delete({
        where: { id }
    });

    res.status(200).json({
        message: 'Item removed from cart'
    });
});

// Clear entire cart
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Delete all user's cart items
    await prisma.cartItem.deleteMany({
        where: {
            userId
        }
    });

    res.status(200).json({
        message: 'Cart cleared successfully'
    });
});

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};