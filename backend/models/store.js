const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  bannerImageURL: {
    type: String,
    required: true,
    trim: true,
  },
});

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;
