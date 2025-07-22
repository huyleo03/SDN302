const express = require("express");
const router = express.Router();
const db = require("../models");

// Lấy lịch sử đơn hàng của user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Tìm các đơn hàng của user theo buyerId
    const orders = await db.Order.find({ buyerId: userId })
      .populate('addressId')  // Chỉ populate addressId vì đó là trường có trong schema
      .sort({ orderDate: -1 });

    if (!orders) {
      return res.json([]);
    }

    // Với mỗi order, tìm các orderItems tương ứng
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      // Tìm orderItems cho order này và populate productId để lấy thông tin sản phẩm
      const orderItems = await db.OrderItem.find({ orderId: order._id })
        .populate({
          path: 'productId',
          select: 'title images' // Chỉ lấy title và images từ Product
        });

      return {
        id: order._id,
        buyerId: order.buyerId,
        addressId: {
          fullName: order.addressId?.fullname,
          phone: order.addressId?.phone,
          street: order.addressId?.street,
          city: order.addressId?.city,
          state: order.addressId?.state,
          country: order.addressId?.country
        },
        orderDate: order.orderDate,
        totalPrice: order.totalPrice,
        status: order.status,
        // Map các orderItems thành format mong muốn
        items: orderItems.map(item => {
          // Xử lý URL ảnh với kích thước
          const imageUrls = item.productId?.images?.map(url => `${url}/190`) || [];
          
          return {
            id: item._id,
            orderId: item.orderId,
            productId: item.productId?._id,
            product_name: item.productId?.title || "Unknown Product",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            images: imageUrls, // URL ảnh đã được thêm kích thước
            product: item.productId ? {
              title: item.productId.title,
              images: imageUrls // URL ảnh đã được thêm kích thước
            } : null
          };
        })
      };
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post("/:orderId/return-request", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, reason } = req.body;

    // Kiểm tra order tồn tại
    const order = await db.Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.status !== "completed") {
      return res.status(400).json({ message: "Đơn hàng không đủ điều kiện để hoàn trả" });
    }
    // Tạo return request
    const returnRequest = new db.ReturnRequest({
      orderId,
      userId,
      reason,
      status: "pending",
      createdAt: new Date()
    });

    await returnRequest.save();

    // Cập nhật trạng thái đơn hàng
    order.status = "return_requested";
    await order.save();

    res.status(201).json({
      message: "Tạo yêu cầu hoàn trả thành công",
      returnRequest
    });
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu hoàn trả:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;