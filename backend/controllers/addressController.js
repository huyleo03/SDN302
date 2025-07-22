const mongoose = require("mongoose");
const Address = require("../models/address");

const addAddress = async (req, res) => {
  try {
    const { fullName, phone, street, city, state, country, isDefault } =
      req.body;
    const userId = req.user.userId;

    if (!fullName || !phone || !street || !city || !state || !country) {
      return res.status(400).json({
        success: false,
        message: "Tất cả các trường là bắt buộc",
        code: "MISSING_FIELDS",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID không hợp lệ",
        code: "INVALID_USER_ID",
      });
    }

    // Kiểm tra nếu user chưa có địa chỉ nào thì set làm default
    const existingAddresses = await Address.find({ userId });
    const shouldBeDefault = existingAddresses.length === 0 || isDefault;

    // Nếu set làm default, update các địa chỉ khác thành false
    if (shouldBeDefault) {
      await Address.updateMany({ userId: userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId,
      fullName,
      phone,
      street,
      city,
      state,
      country,
      isDefault: shouldBeDefault,
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Địa chỉ đã được thêm thành công",
      data: newAddress,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm địa chỉ",
      error: error.message,
    });
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const addresses = await Address.find({ userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: addresses,
      total: addresses.length,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy địa chỉ",
      error: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params; // Changed from addressId to id
    const userId = req.user.userId;
    const { fullName, phone, street, city, state, country, isDefault } =
      req.body;

    // Nếu set làm default, update các địa chỉ khác thành false
    if (isDefault) {
      await Address.updateMany(
        { userId: userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId: userId },
      { fullName, phone, street, city, state, country, isDefault },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật địa chỉ",
      error: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params; // Changed from addressId to id
    const userId = req.user.userId;

    const addressToDelete = await Address.findOne({
      _id: id,
      userId: userId,
    });

    if (!addressToDelete) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ",
      });
    }

    // Nếu xóa địa chỉ default, set địa chỉ khác làm default
    if (addressToDelete.isDefault) {
      const otherAddresses = await Address.find({
        userId: userId,
        _id: { $ne: id }, // Changed from addressId to id
      });

      if (otherAddresses.length > 0) {
        await Address.findByIdAndUpdate(otherAddresses[0]._id, {
          isDefault: true,
        });
      }
    }

    await Address.findByIdAndDelete(id); // Changed from addressId to id

    res.json({
      success: true,
      message: "Xóa địa chỉ thành công",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa địa chỉ",
      error: error.message,
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params; // Changed from addressId to id
    const userId = req.user.userId;

    // Set tất cả addresses thành non-default
    await Address.updateMany({ userId: userId }, { isDefault: false });

    // Set address được chọn thành default
    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId: userId }, // Changed from addressId to id
      { isDefault: true },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ",
      });
    }

    res.json({
      success: true,
      message: "Đã đặt làm địa chỉ mặc định",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đặt địa chỉ mặc định",
      error: error.message,
    });
  }
};

module.exports = {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
