const asyncHandler = require("express-async-handler");

const getAllUsers = asyncHandler(async (req, res) => {
    return res.status(200).json({
        message: "All users",
    })
});

module.exports = {
    getAllUsers
};
