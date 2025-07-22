const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/user");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID là bắt buộc",
        code: "MISSING_PRODUCT_ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product ID không hợp lệ",
        code: "INVALID_PRODUCT_ID",
      });
    }

    if (quantity < 1 || quantity > 999) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải từ 1 đến 999",
        code: "INVALID_QUANTITY",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        code: "PRODUCT_NOT_FOUND",
      });
    }

    if (product.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm không khả dụng",
        code: "PRODUCT_UNAVAILABLE",
        productStatus: product.status,
      });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${product.quantity} sản phẩm trong kho`,
        code: "INSUFFICIENT_STOCK",
        availableQuantity: product.quantity,
      });
    }

    // Kiểm tra sản phẩm đấu giá
    if (product.isAuction) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm đấu giá không thể thêm vào giỏ hàng",
        code: "AUCTION_PRODUCT_NOT_ALLOWED",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex >= 0) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Tổng số lượng không được vượt quá ${product.quantity}`,
          code: "EXCEED_STOCK_LIMIT",
          currentInCart: cart.items[existingItemIndex].quantity,
          requestedAdd: quantity,
          maxAllowed: product.quantity,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].addedAt = new Date();
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        priceAtTime: product.price,
        sellerId: product.sellerId,
        addedAt: new Date(),
      });
    }
    cart.lastActivity = new Date();

    await cart.save();

    await cart.populate([
      {
        path: "items.productId",
        select: "title price images quantity status",
      },
      {
        path: "items.sellerId",
        select: "username",
      },
    ]);

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      message: "Thêm vào giỏ hàng thành công",
      data: {
        cart: {
          _id: cart._id,
          items: cart.items,
          totalItems,
          totalAmount,
          lastActivity: cart.lastActivity,
        },
        addedItem: {
          productId,
          quantity,
          productTitle: product.title,
        },
      },
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm vào giỏ hàng",
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "title price images quantity status",
      })
      .populate({
        path: "items.sellerId",
        select: "username",
      });

    if (!cart) {
      cart = {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
    }

    res.json({
      success: true,
      message: "Lấy giỏ hàng thành công",
      data: cart,
      code: "CART_FETCH_SUCCESS",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy giỏ hàng",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID và quantity là bắt buộc",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Giỏ hàng không tồn tại",
        code: "CART_NOT_FOUND",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không có trong giỏ hàng",
        code: "ITEM_NOT_FOUND",
      });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (product && quantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Chỉ còn ${product.quantity} sản phẩm trong kho`,
          code: "INSUFFICIENT_STOCK",
        });
      }

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].addedAt = new Date();
    }

    cart.lastActivity = new Date();
    await cart.save();

    await cart.populate([
      {
        path: "items.productId",
        select: "title price images quantity status",
      },
      {
        path: "items.sellerId",
        select: "username",
      },
    ]);

    res.json({
      success: true,
      message: "Cập nhật giỏ hàng thành công",
      data: { cart },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật giỏ hàng",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Giỏ hàng không tồn tại",
        code: "CART_NOT_FOUND",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không có trong giỏ hàng",
        code: "ITEM_NOT_FOUND",
      });
    }

    cart.items.splice(itemIndex, 1);
    cart.lastActivity = new Date();
    await cart.save();

    await cart.populate([
      {
        path: "items.productId",
        select: "title price images quantity status",
      },
      {
        path: "items.sellerId",
        select: "username",
      },
    ]);

    res.json({
      success: true,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
      data: { cart },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa khỏi giỏ hàng",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Cart.findOneAndUpdate(
      { userId },
      {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        lastActivity: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({
      success: true,
      message: "Xóa giỏ hàng thành công",
      data: {
        cart: {
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa giỏ hàng",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
};
