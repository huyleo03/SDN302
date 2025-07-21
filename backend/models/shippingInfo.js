const mongoose = require("mongoose");

const shippingInfoSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  carrier: {
    type: String,
    required: true,
    trim: true,
  },
  trackingNumber: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "In Transit", "Delivered", "Cancelled"],
    default: "Pending",
  },
  estimatedArrival: {
    type: Date,
    required: true,
  },
});

const ShippingInfo = mongoose.model("ShippingInfo", shippingInfoSchema);
module.exports = ShippingInfo;
