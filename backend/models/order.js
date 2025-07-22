const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  orderDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  status: {
      type: String,
      enum: ["shipping", "completed", "cancelled", "return_requested", "returned"],
      default: "shipping",
    },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
