const express = require("express");
const router = express.Router();
const db = require("../models");
const mongoose = require("mongoose");

// Tạo yêu cầu hoàn trả
router.post("/create", async (req, res) => {
    try {
        const { orderId, userId, reason } = req.body;

        // Kiểm tra đơn hàng có tồn tại và đã giao chưa
        const order = await db.Order.findById(new mongoose.Types.ObjectId(orderId));
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        if (order.status !== "completed") {
            return res.status(400).json({ message: "Đơn hàng chưa hoàn thành không thể yêu cầu hoàn trả" });
        }

        // Kiểm tra xem đã có yêu cầu hoàn trả cho đơn hàng này chưa
        const existingRequest = await db.ReturnRequest.findOne({ orderId: new mongoose.Types.ObjectId(orderId) });
        if (existingRequest) {
            return res.status(400).json({ message: "Đơn hàng này đã có yêu cầu hoàn trả" });
        }

        // Tạo yêu cầu hoàn trả
        const returnRequest = new db.ReturnRequest({
            orderId: new mongoose.Types.ObjectId(orderId),
            userId: new mongoose.Types.ObjectId(userId),
            reason
        });

        const savedRequest = await returnRequest.save();

        // Cập nhật trạng thái đơn hàng thành return_requested
        order.status = "return_requested";
        await order.save();

        res.status(201).json({
            message: "Đã tạo yêu cầu hoàn trả thành công",
            returnRequest: savedRequest,
            orderStatus: order.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 