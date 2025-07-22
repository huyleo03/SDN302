const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code : {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    maxUsage: {
        type: Number,
        required: true,
        min: 1,
    },
    productId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false, // Optional, can be used for product-specific coupons
    },
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
