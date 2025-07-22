const express = require("express");
const router = express.Router();
const {
  createProducts,
  getAllProducts,
  getProductById,
} = require("../controllers/productController");
const auth = require("../middlewares/authentication");

router.post("/create", createProducts);
router.get("/all", getAllProducts);
router.get("/:id", getProductById);
module.exports = router;
