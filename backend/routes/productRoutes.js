const express = require("express");
const router = express.Router();
const {
  createProducts,
  getAllProducts,
  getProductById,
} = require("../controllers/productController");
const auth = require("../middlewares/authentication");
const reviewController = require('../controllers/reviewController');

router.post("/create", createProducts);
router.get("/all", getAllProducts);
router.get("/:id", getProductById);
router.get('/:productId/reviews', reviewController.getReviewsByProduct);
router.post('/:productId/reviews', reviewController.addReview);
module.exports = router;
