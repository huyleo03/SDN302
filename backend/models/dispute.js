const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Open", "In Review", "Resolved", "Closed"],
    default: "Open",
  },
  resolution: {
    type: String,
    trim: true,
  },
});

const Dispute = mongoose.model("Dispute", disputeSchema);
module.exports = Dispute;
