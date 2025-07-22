const express = require("express");
require("dotenv").config();
const connect = require("./config/db");
const app = express();
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const path = require('path');
const passport = require("passport");
const session = require("express-session");


// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session (nếu dùng Passport session)
app.use(session({ secret: "yourSecret", resave: false, saveUninitialized: true }));

// Middleware
app.use(passport.initialize());
app.use(passport.session()); // Nếu dùng session

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Lỗi server nội bộ",
    message: err.message,
  });
});

// Connect to MongoDB
connect()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Không thể kết nối đến database:", error);
    process.exit(1);
  });
