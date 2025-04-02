require("dotenv").config();
const express = require("express");

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



server.listen(PORT, () => console.log(`Listening on port ${PORT} \nURL: http://localhost:${PORT}`));
