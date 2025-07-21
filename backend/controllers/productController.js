const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const mongoose = require("mongoose");

const createProducts = async (req, res) => {
  try {
    console.log("🚀 Bắt đầu tạo product với data:", req.body);

    const {
      title,
      description,
      price,
      images,
      categoryId,
      sellerId,
      isAuction,
      auctionEndTime,
      quantity,
      status,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !images ||
      !categoryId ||
      !sellerId
    ) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: "Giá sản phẩm phải lớn hơn 0",
        code: "INVALID_PRICE",
      });
    }

    if (!Array.isArray(images) && images.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Phải có ít nhất một hình ảnh",
        code: "EMPTY_IMAGES",
      });
    }

    if (isAuction && !auctionEndTime) {
      return res.status(400).json({
        success: false,
        error: "Sản phẩm đấu giá phải có thời gian kết thúc",
        code: "MISSING_AUCTION_END_TIME",
      });
    }

    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({
          success: false,
          error: "Số lượng phải là một số nguyên không âm",
          code: "INVALID_QUANTITY",
        });
      }
    }

    if (isAuction && quantity !== 1) {
      return res.status(400).json({
        success: false,
        error: "Sản phẩm đấu giá chỉ cho phép số lượng là 1",
        code: "INVALID_AUCTION_QUANTITY",
      });
    }

    const validStatuses = ["available", "sold", "pending"];
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Trạng thái không hợp lệ, chỉ cho phép: ${validStatuses.join(
          ", "
        )}`,
        code: "INVALID_STATUS",
        received: status,
        allowedValues: validStatuses,
      });
    }

    if (status === "sold") {
      return res.status(400).json({
        success: false,
        error: "Không thể tạo sản phẩm với trạng thái 'sold'",
        code: "INVALID_INITIAL_STATUS",
        suggestion:
          "Sử dụng 'available' hoặc bỏ trống để sử dụng giá trị mặc định",
      });
    }

    console.log("🔍 Kiểm tra category và seller...");
    const [categoryExists, sellerExists] = await Promise.all([
      Category.findById(categoryId),
      User.findById(sellerId),
    ]);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category không tồn tại",
      });
    }

    if (!sellerExists) {
      return res.status(400).json({
        success: false,
        message: "Seller không tồn tại",
      });
    }

    console.log("👤 Tạo product mới...");
    const productData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      images: images.filter((img) => img && img.trim()),
      categoryId: mongoose.Types.ObjectId.createFromHexString(categoryId),
      sellerId: mongoose.Types.ObjectId.createFromHexString(sellerId),
      isAuction: Boolean(isAuction),
      quantity: quantity !== undefined ? parseInt(quantity, 10) : 1,
      status: status || "available",
    };

    // Chỉ thêm auctionEndTime nếu là auction
    if (isAuction) {
      productData.auctionEndTime = new Date(auctionEndTime);
    }

    const newProduct = new Product(productData);

    console.log("💾 Lưu product vào database...");
    const savedProduct = await newProduct.save();

    console.log("📊 Populate dữ liệu liên quan...");
    await savedProduct.populate([
      {
        path: "categoryId",
        select: "name description",
      },
      {
        path: "sellerId",
        select: "username email avatarUrl",
        options: { strictPopulate: false },
      },
    ]);
    console.log("✅ Tạo product thành công");

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: {
        product: savedProduct,
        meta: {
          createdAt: savedProduct.createdAt,
          productId: savedProduct._id,
          isAuction: savedProduct.isAuction,
        },
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
        value: e.value,
      }));

      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: validationErrors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `ID không hợp lệ: ${error.path}`,
        field: error.path,
        value: error.value,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} đã tồn tại`,
        field,
        value: error.keyValue[field],
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Lỗi server nội bộ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId")
      .populate("sellerId");

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm nào",
        code: "NO_PRODUCTS_FOUND",
      });
    }

    const formattedProducts = products.map((product) => ({
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      categoryId: {
        _id: product.categoryId._id,
        name: product.categoryId.name,
        description: product.categoryId.description,
      },
      sellerId: {
        _id: product.sellerId._id,
        username: product.sellerId.username,
        email: product.sellerId.email,
        role: product.sellerId.role,
        avatarUrl: product.sellerId.avatarUrl,
      },
      isAuction: product.isAuction,
      quantity: product.quantity,
      status: product.status,
    }));

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: formattedProducts,
      code: "PRODUCTS_FETCHED_SUCCESSFULLY",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server nội bộ khi lấy sản phẩm",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
        code: "INVALID_PRODUCT_ID",
      });
    }

    const product = await Product.findById(productId).populate("categoryId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        code: "PRODUCT_NOT_FOUND",
      });
    }

    const formattedProducts = {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      category: {
        name: product.categoryId.name,
        description: product.categoryId.description,
      },
      quantity: product.quantity,
      isAuction: product.isAuction,
      status: product.status,
    };

    res.status(200).json({
      success: true,
      message: "Lấy sản phẩm thành công",
      data: formattedProducts,
      code: "PRODUCT_FETCHED_SUCCESSFULLY",
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server nội bộ khi lấy sản phẩm theo ID",
      error: error.message,
    });
  }
};

module.exports = {
  createProducts,
  getAllProducts,
  getProductById,
};
