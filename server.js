const express = require("express");
const connectDB = require("./config/db");
const app = express();
// Connect to Atlas
connectDB();

//Midlleware for sending data in the body
app.use(express.json({extended: false}));

const PORT = process.env.PORT || 5000;

// route
app.get("/", (req, res)=> {
    return res.send("<h1>Home page<p>Welcome home</p><h1>");
})

// Making routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/users", require("./routes/api/users"));

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));