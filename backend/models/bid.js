const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    productId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    bidderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount : {
        type: Number,
        required: true,
        min: 0,
    },
    bidTime : {
        type: Date,
        default: Date.now,
    },
});
const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;