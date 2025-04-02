const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

// Create a new order from cart
const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId
        },
        include: {
            product: true
        }
    });

    if (cartItems.length === 0) {
        res.status(400);
        throw new Error('Your cart is empty');
    }

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + (item.quantity * item.product.price);
    }, 0);

    // Create order in transaction
    const order = await prisma.$transaction(async (prisma) => {
        // Create order
        const newOrder = await prisma.order.create({
            data: {
                userId,
                totalPrice,
                status: 'pending'
            }
        });

        // Update product stock
        for (const item of cartItems) {
            if (item.quantity > item.product.stock) {
                throw new Error(`Not enough stock for ${item.product.name}`);
            }

            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: item.product.stock - item.quantity
                }
            });
        }

        // Clear user's cart
        await prisma.cartItem.deleteMany({
            where: {
                userId
            }
        });

        return newOrder;
    });

    res.status(201).json({
        message: 'Order created successfully',
        data: {
            order,
            items: cartItems
        }
    });
});

// Get all orders (Admin only)
const getOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (status) {
        filter.status = status;
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where: filter });

    // Get orders
    const orders = await prisma.order.findMany({
        where: filter,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            payments: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
        message: 'Orders fetched successfully',
        data: orders,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// Get user's orders
const getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { userId };
    if (status) {
        filter.status = status;
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where: filter });

    // Get orders
    const orders = await prisma.order.findMany({
        where: filter,
        include: {
            payments: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
        message: 'User orders fetched successfully',
        data: orders,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// Get order details
const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Build query based on role
    const where = isAdmin ? { id } : { id, userId };

    const order = await prisma.order.findFirst({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            payments: true
        }
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.status(200).json({
        message: 'Order details fetched successfully',
        data: order
    });
});

// Update order status (Admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        res.status(400);
        throw new Error('Valid status is required: pending, paid, shipped, delivered, cancelled');
    }

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
        where: { id }
    });

    if (!orderExists) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Update order
    const order = await prisma.order.update({
        where: { id },
        data: {
            status
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            payments: true
        }
    });

    res.status(200).json({
        message: 'Order status updated successfully',
        data: order
    });
});

module.exports = {
    createOrder,
    getOrders,
    getUserOrders,
    getOrderById,
    updateOrderStatus
};