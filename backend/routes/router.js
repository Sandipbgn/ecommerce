const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");
const paymentRoutes = require("./payment.routes");
const paymentHistoryRoutes = require("./payment-history.routes");
const dashboardRoutes = require("./dashboard.routes");

module.exports = (app) => {
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));

    // Serve static files from storage directory
    app.use('/storage', express.static(path.join(__dirname, '../storage')));

    // User Routes
    app.use("/api/user", userRoutes);

    // Product Routes
    app.use("/api/products", productRoutes);

    // Cart Routes
    app.use("/api/cart", cartRoutes);

    // Order Routes
    app.use("/api/orders", orderRoutes);

    // Checkout Routes
    app.use("/api/checkout", paymentRoutes);

    // Payment History Routes
    app.use("/api/payments", paymentHistoryRoutes);

    // Admin Dashboard Routes
    app.use("/api/admin", dashboardRoutes);
};