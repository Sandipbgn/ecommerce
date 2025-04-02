const express = require("express");
const cors = require("cors");

module.exports = (app) => {
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));

    app.use("/api/user", require("./user.routes"));

};
