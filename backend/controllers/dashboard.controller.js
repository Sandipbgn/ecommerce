const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

// Get sales analytics
const getSalesAnalytics = asyncHandler(async (req, res) => {
    // Get total sales amount (from completed payments)
    const totalSales = await prisma.payment.aggregate({
        where: {
            status: 'completed'
        },
        _sum: {
            amount: true
        }
    });

    // Get sales by status
    const salesByStatus = await prisma.order.groupBy({
        by: ['status'],
        _count: {
            _all: true
        },
        _sum: {
            totalPrice: true
        }
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            },
            payments: true
        }
    });

    // Get total products count
    const productsCount = await prisma.product.count();

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
        where: {
            stock: {
                lte: 5
            }
        },
        orderBy: {
            stock: 'asc'
        },
        take: 10
    });

    // Get top selling products
    // This would require a more complex query with order items
    // For this example, we'll return an empty array
    const topSellingProducts = [];

    res.status(200).json({
        message: 'Dashboard analytics fetched successfully',
        data: {
            totalSales: totalSales._sum.amount || 0,
            salesByStatus,
            recentOrders,
            inventory: {
                totalProducts: productsCount,
                lowStockProducts
            },
            topSellingProducts
        }
    });
});

module.exports = {
    getSalesAnalytics
};