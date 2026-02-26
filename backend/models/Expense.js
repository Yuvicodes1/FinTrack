const mongoose = require("mongoose");

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Travel",
  "Other",
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    note: {
      type: String,
      default: "",
      maxlength: 200,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ── Salary per user per month ────────────────────────────────────────────────
const salarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // month stored as "YYYY-MM" string e.g. "2026-02"
    month: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Unique salary per user per month
salarySchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = {
  Expense: mongoose.model("Expense", expenseSchema),
  Salary: mongoose.model("Salary", salarySchema),
  CATEGORIES,
};