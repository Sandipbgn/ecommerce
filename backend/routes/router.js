const express = require("express");
const cors = require("cors");
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");

module.exports = (app) => {
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));

    app.use("/api/user", userRoutes);
    app.use("/api/product", productRoutes);
};