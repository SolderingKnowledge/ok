const express = require("express");
const connectDB = require("./config/db");
const app = express();
// Connect to Atlas
connectDB();

const PORT = process.env.PORT || 5000;

// route
app.get("/", (req, res)=> {
    return res.send("<h1>Home page<p>Welcome home</p><h1>");
})

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));