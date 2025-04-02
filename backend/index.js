require("dotenv").config();
const express = require("express");
const { errorHandler, notFound } = require("./middleware/error.middleware");


const app = express();
const server = require("http").createServer(app);

const PORT = process.env.PORT || 3030;

app.use((req, res, next) => {
    const url = req.url;
    const user = req?.user;
    const method = req.method;
    console.log(`${user?.name || ""} hitted ${method} on ${url}`);
    next();
});

require("./routes/router")(app);

const setupSwagger = require("./utils/swagger");
setupSwagger(app);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => console.log(`Listening on port ${PORT} \nURL: http://localhost:${PORT}`));