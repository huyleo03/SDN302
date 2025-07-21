const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAuction: {
      type: Boolean,
      default: false,
    },
    auctionEndTime: {
      type: Date,
      required: function () {
        return this.isAuction;
      },
    },
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema, "Product");
module.exports = Product;
