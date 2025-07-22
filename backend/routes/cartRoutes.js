const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const auth = require("../middlewares/authentication");

router.post("/add", auth, addToCart);
router.get("/", auth, getCart);
router.put("/update", auth, updateCart);
router.delete("/remove/:productId", auth, removeFromCart);
router.delete("/clear", auth, clearCart);
module.exports = router;
