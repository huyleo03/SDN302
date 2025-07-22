const Review = require('../models/review');
const User = require('../models/user');
const mongoose = require('mongoose');

// Lấy tất cả review của 1 sản phẩm
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("productId nhận được:", productId);
    // Ép kiểu productId về ObjectId
    const reviews = await Review.find({ productId: new mongoose.Types.ObjectId(productId) })
      .populate('userId', 'username avatarUrl');
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy đánh giá', error: err.message });
  }
};

// Thêm review mới cho sản phẩm
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user?.userId || req.body.userId; // lấy từ token hoặc body
    if (!productId || !userId || !rating) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    const review = new Review({ productId, userId, rating, comment });
    await review.save();
    res.json({ success: true, message: 'Đã thêm đánh giá', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm đánh giá', error: err.message });
  }
};

module.exports = { getReviewsByProduct, addReview }; 