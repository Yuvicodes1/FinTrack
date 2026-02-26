const mongoose = require("mongoose");

// ===========================================
// 📦 Stock Schema
// _id: true (default) so each stock gets a
// unique ID — avoids symbol collision bugs
// when a user holds the same ticker twice
// ===========================================
const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  // Stored in USD for live stocks, user currency for custom assets
  buyPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  estSellPrice: {
    type: Number,
    default: null,
    min: 0,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
});  // _id: true is the Mongoose default — intentionally left enabled


// ===========================================
// 📊 Portfolio Schema
// ===========================================
const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    stocks: [stockSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);