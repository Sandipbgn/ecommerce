const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');
const fs = require('fs');
const path = require('path');

// Get all products with pagination and filtering
const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, minPrice, maxPrice, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};

    if (category) {
        filter.category = category;
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.gte = parseFloat(minPrice);
        if (maxPrice) filter.price.lte = parseFloat(maxPrice);
    }

    if (search) {
        filter.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    const total = await prisma.product.count({ where: filter });

    const products = await prisma.product.findMany({
        where: filter,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order }
    });

    res.status(200).json({
        message: 'Products fetched successfully',
        data: products,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});


const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.status(200).json({
        message: 'Product fetched successfully',
        data: product
    });
});

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || stock === undefined || !category) {
        res.status(400);
        throw new Error('Please provide all required fields: name, description, price, stock, category');
    }

    // Handle file upload
    let imageUrl = null;
    if (req.file) {
        // Generate image URL based on server domain and file path
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        imageUrl = `${baseUrl}/storage/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.create({
        data: {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            imageUrl
        }
    });

    res.status(201).json({
        message: 'Product created successfully',
        data: product
    });
});


const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;


    const productExists = await prisma.product.findUnique({
        where: { id }
    });

    if (!productExists) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Handle file upload
    let imageUrl = undefined;
    if (req.file) {
        // Delete old image if exists
        if (productExists.imageUrl) {
            const oldImagePath = productExists.imageUrl.split('/storage/uploads/')[1];
            if (oldImagePath) {
                const fullPath = path.join(__dirname, '../storage/uploads', oldImagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }

        // Generate new image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        imageUrl = `${baseUrl}/storage/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({
        where: { id },
        data: {
            name: name !== undefined ? name : undefined,
            description: description !== undefined ? description : undefined,
            price: price !== undefined ? parseFloat(price) : undefined,
            stock: stock !== undefined ? parseInt(stock) : undefined,
            category: category !== undefined ? category : undefined,
            imageUrl: imageUrl
        }
    });

    res.status(200).json({
        message: 'Product updated successfully',
        data: product
    });
});


const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const productExists = await prisma.product.findUnique({
        where: { id }
    });

    if (!productExists) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Delete product image if exists
    if (productExists.imageUrl) {
        const imagePath = productExists.imageUrl.split('/storage/uploads/')[1];
        if (imagePath) {
            const fullPath = path.join(__dirname, '../storage/uploads', imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
    }

    // Delete product
    await prisma.product.delete({
        where: { id }
    });

    res.status(200).json({
        message: 'Product deleted successfully'
    });
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};