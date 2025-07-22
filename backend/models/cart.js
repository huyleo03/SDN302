const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [  
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          max: 999,
        },
        priceAtTime: {
          type: Number,
          required: true,
          min: 0,
        },
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["active", "saved_for_later", "unavailable"],
          default: "active",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "checkout", "abandoned"],
      default: "active",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    indexes: [{ userId: 1 }, { "items.productId": 1 }, { lastActivity: 1 }],
  }
);

// Virtual để tự động tính totalItems và totalAmount
cartSchema.virtual('computedTotalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('computedTotalAmount').get(function() {
  return this.items.reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
});

// Pre-save middleware để cập nhật totalItems và totalAmount
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
  next();
});

const Cart = mongoose.model("Cart", cartSchema, "Cart");
module.exports = Cart;
